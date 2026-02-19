import jsPDF from 'jspdf';
import { User, CartItem } from './store'; // Assuming types are in store or similar

export const generateRentalAgreement = async (user: User, cartItems: CartItem[]): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');

        const textLines = doc.splitTextToSize(text, pageWidth - (margin * 2));

        // Check for page break
        if (y + (textLines.length * fontSize * 0.5) > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        if (align === 'center') {
            doc.text(text, pageWidth / 2, y, { align: 'center' });
        } else if (align === 'right') {
            doc.text(text, pageWidth - margin, y, { align: 'right' });
        } else {
            doc.text(textLines, margin, y);
        }

        y += (textLines.length * fontSize * 0.4) + 4;
    };

    const addGap = (amount: number = 10) => {
        y += amount;
    };

    // --- HEADER ---
    addText("DIGITAL RENTAL AGREEMENT", 18, true, 'center');
    addGap(5);

    const agreementId = `AGR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    addText(`Agreement ID: ${agreementId}`, 10, false, 'right');
    addText(`Date of Execution: ${date}`, 10, false, 'right');
    addGap(10);

    addText(`This Rental Agreement ("Agreement") is entered into on this day, ${date}, by and between the Company and the Customer as defined below.`);
    addGap(5);

    // --- 1. PARTIES ---
    addText("1. PARTIES", 12, true);

    // COMPANY
    addText("COMPANY (Lessor):", 10, true);
    addText("• Company Name: Sb-Tech Rentals"); // Replace with actual company name if available
    addText("• Registered Address: 123 Tech Park, Bangalore, KA, 560001");
    addText("• Contact: support@sbtech.com | +91 98765 43210");
    addGap(3);

    // CUSTOMER
    addText("CUSTOMER (Lessee):", 10, true);
    addText(`• Name: ${user.name}`);
    addText(`• Email: ${user.email}`);
    addText(`• Phone: ${user.addresses?.[0]?.phone || 'N/A'}`);
    addText(`• Delivery Address: ${user.addresses?.[0] ? `${user.addresses[0].address}, ${user.addresses[0].city}, ${user.addresses[0].state} - ${user.addresses[0].pincode}` : 'Registered Address'}`);
    addGap(5);

    // --- 2. PRODUCT DETAILS ---
    addText("2. PRODUCT DETAILS", 12, true);
    addText("The Company agrees to rent to the Customer the following equipment:");

    cartItems.filter(item => item.type === 'rent').forEach((item, index) => {
        y += 2; // slight gap per item
        addText(`Item ${index + 1}:`, 10, true);
        addText(`• Product: ${item.name}`);
        addText(`• Specifications: ${item.variants?.ram || ''} ${item.variants?.ssd || ''} ${item.variants?.color || ''}`);
        addText(`• Condition: Refurbished / Good`);
        addText(`• Value: ₹${item.price.toLocaleString()}`); // Or original value if tracked
    });
    if (!cartItems.some(i => i.type === 'rent')) {
        addText("(No rental items selected in cart, but agreement generated for verification purposes)");
    }
    addGap(5);

    // --- 3. RENTAL TERMS & PAYMENTS ---
    addText("3. RENTAL TERMS & PAYMENTS", 12, true);

    // Calculate specific totals if possible, or use placeholders based on cart
    const rentalItems = cartItems.filter(i => i.type === 'rent');
    const monthlyTotal = rentalItems.reduce((sum, item) => sum + item.price, 0); // Assuming price is monthly rent
    const depositTotal = rentalItems.length * 200; // Example based on Checkout.tsx logic

    addText(`• Rental Duration: 12 Months (Standard)`); // Placeholder or passed prop
    addText(`• Start Date: ${date} | End Date: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}`);
    addText(`• Monthly Rental Fee: ₹${monthlyTotal.toLocaleString()} (Inclusive of GST)`);
    addText(`• Security Deposit: ₹${depositTotal.toLocaleString()} (Refundable)`);
    addText(`• Late Return Fee: ₹500 per day beyond the End Date.`);
    addGap(5);

    // --- 4. TERMS AND CONDITIONS ---
    addText("4. TERMS AND CONDITIONS", 12, true);

    addText("4.1 Payment & Security Deposit", 10, true);
    addText("The Customer shall pay the rental fee in advance. The Security Deposit is held to cover potential damages or unpaid dues and will be refunded within 7-10 working days after the product is returned and passes a technical inspection.");
    addGap(2);

    addText("4.2 Delivery & Return", 10, true);
    addText("The Company will deliver the product to the registered address. Upon the expiry of the rental period, the Customer is responsible for ensuring the product is ready for pickup or return in its original packaging (if provided).");
    addGap(2);

    addText("4.3 Customer Responsibilities", 10, true);
    addText("The Customer agrees to use the equipment solely for lawful purposes and shall not:");
    addText("• Make any unauthorized hardware or software modifications.");
    addText("• Remove any \"Warranty Void\" stickers or serial tags.");
    addText("• Sub-rent, lend, or transfer the product to any third party.");
    addGap(2);

    addText("4.4 Damage, Loss, or Theft", 10, true);
    addText("• Minor Damage: Costs for repairs will be deducted from the Security Deposit.");
    addText("• Total Loss/Theft: The Customer is liable to pay the Full Replacement Cost of the product as per the current market value.");
    addText("• Data Security: The Customer is responsible for backing up their data. The Company will wipe all data upon return and is not liable for data loss.");
    addGap(2);

    addText("4.5 Termination", 10, true);
    addText("The Company reserves the right to terminate this agreement immediately and repossess the equipment if the Customer defaults on payments or violates any terms of this Agreement.");
    addGap(10);

    // --- SIGNATURE SECTION ---
    if (y + 40 > pageHeight) {
        doc.addPage();
        y = margin;
    }

    addText("ACCEPTED AND AGREED BY:", 10, true);
    addGap(10);

    // Digital Signature Representation
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, 80, 40, 3, 3); // Box for signature

    doc.setFontSize(8);
    doc.text("Digitally Signed by:", margin + 5, y + 10);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.text(user.name, margin + 10, y + 25);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Date & Time: ${new Date().toLocaleString()}`, margin + 5, y + 35);

    return doc.output('blob');
};
