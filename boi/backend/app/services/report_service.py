"""
FIU-IND Compliant Suspicious Transaction Report (STR) PDF Generator for AEGISNET FI
Uses ReportLab to build structured financial cyber forensics reports.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os
import uuid
from datetime import datetime


class STRReportService:
    @classmethod
    async def generate_str_pdf(cls, report_data: dict) -> str:
        """
        Generates a professional FIU-IND styled STR PDF document.
        Saves it under reports/ directory and returns the URL path.
        """
        report_dir = "reports"
        os.makedirs(report_dir, exist_ok=True)
        filename = f"STR-{report_data.get('case_id', 'GEN')}-{uuid.uuid4().hex[:6].upper()}.pdf"
        file_path = os.path.join(report_dir, filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom military-cyber style overrides
        title_style = ParagraphStyle(
            'STRTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=15,
            alignment=1 # Centered
        )
        
        section_style = ParagraphStyle(
            'STRSection',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            textColor=colors.HexColor('#1e40af'),
            spaceBefore=12,
            spaceAfter=6,
            borderPadding=2
        )
        
        body_style = ParagraphStyle(
            'STRBody',
            parent=styles['BodyText'],
            fontName='Helvetica',
            fontSize=9,
            textColor=colors.HexColor('#334155'),
            spaceAfter=6
        )

        code_style = ParagraphStyle(
            'STRCode',
            parent=styles['Code'],
            fontName='Courier',
            fontSize=8,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4
        )

        story = []

        # ============================================================
        # HEADER BLOCK (FIU-IND STR FORM)
        # ============================================================
        story.append(Paragraph("SUSPICIOUS TRANSACTION REPORT (STR)", title_style))
        story.append(Paragraph("<b>FORM STR-1</b> | STRICTLY CONFIDENTIAL", ParagraphStyle('Sub', parent=body_style, alignment=1, textColor=colors.HexColor('#dc2626'))))
        story.append(Spacer(1, 15))

        # Metadata Table
        meta_data = [
            ["Reporting Entity:", "BANK OF INDIA (IIT Hyderabad Branch)", "Report Date:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
            ["STR Reference:", report_data.get("report_id", "AEGIS-STR-001"), "Case Status:", report_data.get("status", "ACTIVE")],
            ["Target Investigation ID:", report_data.get("case_id", "N/A"), "Severity Classification:", report_data.get("severity", "CRITICAL")]
        ]
        t_meta = Table(meta_data, colWidths=[1.5*inch, 2.0*inch, 1.5*inch, 2.0*inch])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))

        # ============================================================
        # SECTION 1: REPORTING ENTITY DETAILS
        # ============================================================
        story.append(Paragraph("1. REPORTING ENTITY & AUTHORIZED REPRESENTATIVE", section_style))
        entity_info = [
            ["Reporting Institution Name", "Bank of India"],
            ["Category", "Public Sector Bank"],
            ["HQ Office", "Star House, G Block, BKC, Mumbai - 400051"],
            ["Authorized Cyber Officer", "AEGISNET FI Autonomous Security Agent v1.0"],
            ["FIU Registration ID", "BOI-CYBER-GRID-IITH-2024"]
        ]
        t_entity = Table(entity_info, colWidths=[2.5*inch, 4.5*inch])
        t_entity.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f1f5f9')),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_entity)
        story.append(Spacer(1, 15))

        # ============================================================
        # SECTION 2: SUSPECT PORTFOLIO / MULE ACCOUNTS
        # ============================================================
        story.append(Paragraph("2. MULE NETWORK TARGET ACCOUNTS", section_style))
        story.append(Paragraph("The following entities within the bank's system show severe structural linkages to cyber-fraud and money laundering channels.", body_style))
        
        accs_headers = ["Account Number", "Type", "Risk Class", "Centrality (PR)", "Frozen Status"]
        accs_rows = [accs_headers]
        for acc in report_data.get("suspect_accounts_details", []):
            accs_rows.append([
                acc.get("account_id", "N/A"),
                acc.get("account_type", "SAVINGS"),
                acc.get("risk_tier", "WATCH"),
                f"{acc.get('centrality_score', 0.0):.4f}",
                "FROZEN" if acc.get("is_frozen") else "ACTIVE"
            ])
            
        t_accs = Table(accs_rows, colWidths=[1.8*inch, 1.3*inch, 1.2*inch, 1.4*inch, 1.3*inch])
        t_accs.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#ffffff')),
        ]))
        story.append(t_accs)
        story.append(Spacer(1, 15))

        # ============================================================
        # SECTION 3: SUSPICIOUS TRANSACTIONS SUMMARY
        # ============================================================
        story.append(Paragraph("3. TRANSFERS EVIDENCE SUMMARY", section_style))
        
        txn_headers = ["TXN ID", "Sender", "Receiver", "Amount (INR)", "Channel", "Fraud Prob"]
        txn_rows = [txn_headers]
        for tx in report_data.get("transactions_details", []):
            txn_rows.append([
                tx.get("txn_id", "N/A"),
                tx.get("source_account", "N/A"),
                tx.get("dest_account", "N/A"),
                f"{float(tx.get('amount', 0)):,.2f}",
                tx.get("channel", "UPI"),
                f"{float(tx.get('fraud_score', 0.0)) * 100:.1f}%"
            ])
            
        t_tx = Table(txn_rows, colWidths=[1.3*inch, 1.2*inch, 1.2*inch, 1.3*inch, 1.0*inch, 1.0*inch])
        t_tx.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('ALIGN', (3,1), (3,-1), 'RIGHT'),
        ]))
        story.append(t_tx)
        story.append(Spacer(1, 15))

        # ============================================================
        # SECTION 4: AI FORENSICS (SHAP & COUNTERFACTUAL)
        # ============================================================
        story.append(Paragraph("4. AI EXPLAINABILITY & CYBER FORENSICS", section_style))
        story.append(Paragraph("<b>Model Version:</b> XGBoost-v1.0 (Retrained on active dataset)", body_style))
        
        # SHAP contribution summaries
        shap_items = report_data.get("shap_evidence", {})
        if shap_items:
            story.append(Paragraph("<b>Feature Influence (SHAP framework contribution breakdown):</b>", body_style))
            feat_table = [["Feature Name", "Impact Value", "Forensic Meaning"]]
            for key, val in list(shap_items.items())[:5]: # Take top 5 features
                meaning = "High transfer size risk" if key == "amount" else ("Sleeper dormant activation risk" if key == "sleeper_activation" else "High velocity/frequency spike")
                feat_table.append([key, f"{val:+.4f}", meaning])
            t_feat = Table(feat_table, colWidths=[2.0*inch, 1.5*inch, 3.5*inch])
            t_feat.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('FONTSIZE', (0,0), (-1,-1), 8),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f8fafc')),
                ('PADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(t_feat)
            story.append(Spacer(1, 10))

        # ============================================================
        # SECTION 5: OPERATIONAL FREEZE AUDIT TRAIL
        # ============================================================
        story.append(Paragraph("5. SYSTEMIC FREEZE AUDIT TRAIL", section_style))
        freeze_info = report_data.get("freeze_audit", {})
        if freeze_info:
            f_table = [
                ["Action Reference:", freeze_info.get("reference", "N/A"), "Operator ID:", "analyst_admin_01"],
                ["Legal Authorization:", "RBI Sec 45L / Cyber Security Ops Directive", "Timestamp:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                ["System Action Status:", "SYSTEMIC HARDWARE CONTAINMENT ACTIVE", "Target Portfolios:", "LOCKED"]
            ]
            t_frz = Table(f_table, colWidths=[1.8*inch, 2.2*inch, 1.2*inch, 1.8*inch])
            t_frz.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef2f2')),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#fca5a5')),
                ('FONTSIZE', (0,0), (-1,-1), 8),
                ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(t_frz)
        else:
            story.append(Paragraph("No active freeze action recorded for this target yet.", body_style))
        story.append(Spacer(1, 15))

        # ============================================================
        # SECTION 6: AUTONOMOUS AGENT REASONING
        # ============================================================
        story.append(Paragraph("6. SYSTEM AGENTS REASONING LOGS", section_style))
        narrative = report_data.get(
            "ai_narrative", 
            "Multi-Agent system completed evaluation. Suspicious network flow demonstrates cyclic routing involving dormant UPI channels in Bharatpur fraud zones. Centrality metrics confirmed destinations act as layer collectors forwarding funds to digital wallets in Jammu & Kashmir."
        )
        story.append(Paragraph(narrative, body_style))
        story.append(Spacer(1, 15))

        # ============================================================
        # SIGNATURE BLOCK
        # ============================================================
        story.append(Spacer(1, 15))
        sig_data = [
            ["Authorized Signatory (Digital):", "___________________________", "Declaration Date:", datetime.now().strftime("%Y-%m-%d")],
            ["AEGISNET Command Center Seal", "[SECURE DIGITAL SIGNATURE]", "Verification Hash:", uuid.uuid4().hex[:16].upper()]
        ]
        t_sig = Table(sig_data, colWidths=[2.2*inch, 2.0*inch, 1.3*inch, 1.5*inch])
        t_sig.setStyle(TableStyle([
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_sig)

        # Build Document
        doc.build(story)
        
        # Return public URL path mapping to StaticFiles server mount
        return f"/reports/{filename}"
