import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, User } from './types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './supabase';

const generateInvoiceBlob = (order: Order, user: User | null): Blob => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("AvN Tech Solution", 14, 20); // Rebranded Name

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Technology Rentals & Sales", 14, 26);
    doc.text("GSTIN: 29ABCDE1234F1Z5", 14, 31);
    doc.text("Support: +91 1800-AvN-TECH", 14, 36);

    // --- Invoice Details (Right Side) ---
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Invoice No: INV-${order.id.split('-')[1] || order.id}`, pageWidth - 14, 20, { align: "right" });
    doc.text(`Date: ${order.date}`, pageWidth - 14, 26, { align: "right" });
    doc.text(`Order Status: ${order.status}`, pageWidth - 14, 32, { align: "right" });

    // --- Bill To ---
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("Bill To:", 14, 50);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(order.userName || user?.name || "Guest", 14, 56);
    doc.text(order.userEmail || user?.email || "", 14, 61);

    // Wrap address text
    const addressLines = doc.splitTextToSize(order.address || "No Address Provided", 80);
    doc.text(addressLines, 14, 66);

    // --- Table ---
    const tableColumn = ["Item", "Type", "Details", "Qty", "Price"];
    const tableRows = order.items.map(item => {
        let details = "";
        if (item.type === 'rent') {
            details = `${item.tenure} Months Rental`;
        } else {
            details = `Outright Purchase`;
        }
        if (item.variants) {
            details += `\n${item.variants.color || ''} ${item.variants.ram || ''}`;
        }

        return [
            item.name,
            item.type.toUpperCase(),
            details,
            item.quantity,
            `INR ${item.price.toLocaleString()}`
        ];
    });

    // Calculate position for table based on address length
    const startY = 66 + (addressLines.length * 5) + 10;

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        theme: 'grid',
        headStyles: { fillColor: [217, 70, 239] }, // Brand Primary Color (approx)
        styles: { fontSize: 9 },
    });

    // --- Totals ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0);

    // Align to right
    const rightX = pageWidth - 14;

    doc.text(`Subtotal: INR ${order.total.toLocaleString()}`, rightX, finalY, { align: "right" });

    if (order.depositAmount && order.depositAmount > 0) {
        doc.text(`Security Deposit (Refundable): INR ${order.depositAmount.toLocaleString()}`, rightX, finalY + 6, { align: "right" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Paid: INR ${(order.total + order.depositAmount).toLocaleString()}`, rightX, finalY + 14, { align: "right" });
    } else {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Paid: INR ${order.total.toLocaleString()}`, rightX, finalY + 10, { align: "right" });
    }

    // --- Footer ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for choosing AvN Tech Solution.", 14, doc.internal.pageSize.height - 20);
    doc.text("This is a computer generated invoice and does not require a signature.", 14, doc.internal.pageSize.height - 15);

    return doc.output('blob');
};

const uploadInvoice = async (order: Order, blob: Blob): Promise<string> => {
    // Determine folder based on contents
    const isRental = order.items.some(item => item.type === 'rent');
    const folder = isRental ? 'rentals' : 'purchases';
    const fileName = `${folder}/invoice-${order.id}.pdf`;

    const { data, error } = await supabase.storage
        .from('order-invoices')
        .upload(fileName, blob, {
            upsert: true,
            contentType: 'application/pdf'
        });

    if (error) {
        console.error("Supabase upload error:", error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('order-invoices')
        .getPublicUrl(fileName);

    return publicUrl;
}

export const createAndUploadInvoice = async (order: Order, user: User | null): Promise<string> => {
    const blob = generateInvoiceBlob(order, user);
    const publicUrl = await uploadInvoice(order, blob);
    return publicUrl;
};

export const generateInvoice = async (order: Order, user: User | null): Promise<void> => {
    // 1. If Invoice Exists, Open It
    if (order.invoiceUrl) {
        window.open(order.invoiceUrl, '_blank');
        return;
    }

    try {
        // 2. Reuse logic
        const publicUrl = await createAndUploadInvoice(order, user);
        console.log("Invoice Uploaded:", publicUrl);

        // 3. Update Firestore Order Record
        if (order.userId) {
            const userDocRef = doc(db, 'users', order.userId);
            const snapshot = await getDoc(userDocRef);
            if (snapshot.exists()) {
                const userData = snapshot.data();
                const updatedOrders = (userData.orders || []).map((o: Order) => {
                    if (o.id === order.id) {
                        return { ...o, invoiceUrl: publicUrl };
                    }
                    return o;
                });
                await updateDoc(userDocRef, { orders: updatedOrders });
            }
        }

        // 4. Open the URL
        window.open(publicUrl, '_blank');

    } catch (error: any) {
        console.error("Error generating/uploading invoice:", error);
        alert(`Failed to generate invoice: ${error.message || error}`);
    }
};
