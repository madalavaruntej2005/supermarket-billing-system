import io
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_invoice_pdf(invoice):
    """
    Generates a professional PDF receipt for an Invoice using ReportLab.
    Returns a BytesIO buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#64748B'),
        leading=12,
    )
    inv_title_style = ParagraphStyle(
        'InvTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor('#1E293B'),
        alignment=2 # Right
    )
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        alignment=2 # Right
    )
    table_hdr_style = ParagraphStyle(
        'TableHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.white,
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#1E293B'),
    )
    table_cell_right = ParagraphStyle(
        'TableCellRight',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#1E293B'),
        alignment=2
    )
    table_bold_right = ParagraphStyle(
        'TableBoldRight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#1E293B'),
        alignment=2
    )

    story = []

    # Header section: SuperMart Info (Left) & Invoice Meta (Right)
    header_data = [
        [
            Paragraph("<b>SuperMart</b><br/><font size=9 color='#64748B'>Smart Supermarket & Retail POS<br/>123 Market Central, MG Road, Bengaluru - 560001<br/>Phone: +91 80 2345 6789 | GSTIN: 29AAAAA0000A1Z5</font>", subtitle_style),
            Paragraph(f"<b>TAX INVOICE</b><br/><font size=10 color='#2563EB'>#{invoice.invoice_number}</font><br/><font size=8 color='#64748B'>Date: {invoice.created_at.strftime('%d-%b-%Y %I:%M %p')}<br/>Cashier: {invoice.cashier.username.title()}</font>", meta_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[3.5*inch, 4.0*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(header_table)

    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceBefore=8, spaceAfter=12))

    # Bill To section
    customer_name = invoice.customer_name or (invoice.customer.name if invoice.customer else "Walk-in Customer")
    customer_phone = invoice.customer_phone or (invoice.customer.phone if invoice.customer and invoice.customer.phone else "N/A")
    bill_to_data = [
        [
            Paragraph(f"<b>BILL TO:</b><br/><b>{customer_name}</b><br/><font color='#64748B'>Phone: {customer_phone}</font>", subtitle_style),
            Paragraph(f"<b>Payment Method:</b> {invoice.get_payment_method_display().upper()}<br/><b>Payment Status:</b> <font color='#16A34A'><b>{invoice.payment_status.upper()}</b></font>", meta_style)
        ]
    ]
    bill_table = Table(bill_to_data, colWidths=[4.0*inch, 3.5*inch])
    bill_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(bill_table)

    # Line Items Table
    items_header = [
        Paragraph("#", table_hdr_style),
        Paragraph("Item Description", table_hdr_style),
        Paragraph("Qty", table_hdr_style),
        Paragraph("Price (INR)", table_hdr_style),
        Paragraph("GST %", table_hdr_style),
        Paragraph("Tax (INR)", table_hdr_style),
        Paragraph("Total (INR)", table_hdr_style),
    ]

    items_rows = [items_header]
    for idx, item in enumerate(invoice.items.all(), 1):
        items_rows.append([
            Paragraph(str(idx), table_cell_style),
            Paragraph(item.product_name, table_cell_style),
            Paragraph(str(item.quantity), table_cell_style),
            Paragraph(f"₹{item.unit_price:.2f}", table_cell_right),
            Paragraph(f"{item.tax_rate:.1f}%", table_cell_right),
            Paragraph(f"₹{item.tax_amount:.2f}", table_cell_right),
            Paragraph(f"₹{item.total:.2f}", table_cell_right),
        ])

    items_table = Table(items_rows, colWidths=[0.3*inch, 2.7*inch, 0.6*inch, 1.0*inch, 0.8*inch, 0.9*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    story.append(items_table)

    story.append(Spacer(1, 14))

    # Summary Table (Subtotal, Discount, GST, Grand Total)
    summary_data = [
        [Paragraph("", table_cell_style), Paragraph("Subtotal:", table_cell_right), Paragraph(f"₹{invoice.subtotal:.2f}", table_cell_right)],
        [Paragraph("", table_cell_style), Paragraph(f"Discount ({invoice.get_discount_type_display()}):", table_cell_right), Paragraph(f"- ₹{invoice.discount_amount:.2f}", table_cell_right)],
        [Paragraph("", table_cell_style), Paragraph("Total GST / Tax:", table_cell_right), Paragraph(f"+ ₹{invoice.tax_amount:.2f}", table_cell_right)],
        [Paragraph("", table_cell_style), Paragraph("<b>Grand Total:</b>", table_bold_right), Paragraph(f"<b>₹{invoice.grand_total:.2f}</b>", table_bold_right)],
        [Paragraph("", table_cell_style), Paragraph("Amount Paid:", table_cell_right), Paragraph(f"₹{invoice.amount_paid:.2f}", table_cell_right)],
        [Paragraph("", table_cell_style), Paragraph("Change Due:", table_cell_right), Paragraph(f"₹{invoice.change_due:.2f}", table_cell_right)],
    ]
    summary_table = Table(summary_data, colWidths=[3.7*inch, 2.3*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (1, 3), (2, 3), 1.5, colors.HexColor('#2563EB')),
        ('BACKGROUND', (1, 3), (2, 3), colors.HexColor('#EFF6FF')),
    ]))
    story.append(summary_table)

    story.append(Spacer(1, 24))

    # Footer note
    footer_text = Paragraph(
        "<para align='center'><font size=9 color='#64748B'>"
        "Thank you for shopping at <b>SuperMart</b>!<br/>"
        "Goods once sold can be exchanged within 7 days with the original receipt.<br/>"
        "Customer Support: support@supermart.com | Visit: www.supermart.local"
        "</font></para>",
        styles['Normal']
    )
    story.append(footer_text)

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
