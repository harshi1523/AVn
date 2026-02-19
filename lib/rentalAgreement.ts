import jsPDF from 'jspdf';
import { User, CartItem } from './store';

export const generateRentalAgreement = async (user: User, cartItems: CartItem[]): Promise<Blob> => {
    console.log("generateRentalAgreement called with user:", user.id, "Items:", cartItems.length);
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let y = 20;

        const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');

            // Split text into lines that fit within the page width minus margins
            const textLines = doc.splitTextToSize(text, pageWidth - (margin * 2));

            // Check if we need to add a new page
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

            // Increment y position based on number of lines
            y += (textLines.length * fontSize * 0.3527) + 5; // approx conversion from pt to mm + spacing
        };

        const addGap = (amount: number = 5) => {
            y += amount;
        };

        // --- HEADER ---
        addText("DIGITAL RENTAL AGREEMENT", 16, true, 'center');
        addGap(5);

        const agreementId = `AGR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        const dateObj = new Date();
        const date = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        addText(`Agreement ID: ${agreementId}`, 10, false, 'right');
        addText(`Date of Execution: ${date}`, 10, false, 'right');
        addGap(5);

        addText(`This Rental Agreement ("Agreement") is entered into on this day, ${date}, by and between the Company and the Customer as defined below.`);
        addGap(5);

        // --- 1. PARTIES ---
        addText("1. PARTIES", 12, true);

        // COMPANY
        addText("COMPANY (Lessor):", 10, true);
        addText("• Company Name: Sb-Tech Rentals");
        addText("• Registered Address: 123 Tech Park, Bangalore, KA, 560001");
        addText("• Contact: support@sb-tech.com | +91 98765 43210");
        addGap(2);

        // CUSTOMER
        addText("CUSTOMER (Lessee):", 10, true);
        addText(`• Name: ${user.name}`);
        addText(`• Email: ${user.email}`);
        addText(`• Phone: ${user.addresses?.[0]?.phone || 'N/A'}`);
        const addr = user.addresses?.[0];
        const addressString = addr ? `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}` : 'Registered Address';
        addText(`• Delivery Address: ${addressString}`);
        addGap(5);

        // --- 2. PRODUCT DETAILS ---
        addText("2. PRODUCT DETAILS", 12, true);
        addText("The Company agrees to rent to the Customer the following equipment:");

        // Filter for rental items
        const rentalItems = cartItems.filter(item => item.type === 'rent');
        const itemsToDisplay = rentalItems.length > 0 ? rentalItems : cartItems; // Fallback if no rental items explicitly found (e.g. mixed cart)

        itemsToDisplay.forEach((item, index) => {
            y += 2;
            addText(`Item ${index + 1}:`, 10, true);
            // Fix category access safely
            const itemAny = item as any;
            addText(`• Product Category: ${itemAny.category || 'Electronic Device'}`);
            addText(`• Brand & Model: ${item.name}`);
            addText(`• Serial Number: ${item.id.slice(0, 8).toUpperCase()}-${Math.floor(Math.random() * 10000)}`); // Simulated Serial
            addText(`• Condition: Refurbished / Good`);
            addText(`• Included Accessories: Charger, Compatible Cable`);
        });
        addGap(5);

        // --- 3. RENTAL TERMS & PAYMENTS ---
        addText("3. RENTAL TERMS & PAYMENTS", 12, true);

        const monthlyTotal = itemsToDisplay.reduce((sum, item) => sum + (item.price || 0), 0);
        const depositTotal = itemsToDisplay.length * 2000; // Example deposit logic, adjust as needed

        addText(`• Rental Duration: 12 Months`);

        const endDate = new Date(dateObj);
        endDate.setFullYear(endDate.getFullYear() + 1);
        const endDateStr = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        addText(`• Start Date: ${date} | End Date: ${endDateStr}`);
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

        doc.setLineWidth(0.5);
        doc.setDrawColor(0);
        doc.roundedRect(margin, y, 80, 40, 3, 3);

        doc.setFontSize(8);
        doc.text("Digitally Signed by:", margin + 5, y + 10);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");

        const signedName = user.name || "Customer";
        doc.text(signedName, margin + 10, y + 25);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Date & Time: ${new Date().toLocaleString()}`, margin + 5, y + 35);

        return doc.output('blob');
    } catch (error) {
        console.error("Critical error in generateRentalAgreement:", error);
        throw error;
    }
};
