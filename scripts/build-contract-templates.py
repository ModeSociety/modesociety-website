"""
Builds the four contract templates (SP-113) from Asha's Word files: PandaDoc field tags in Schedule 1,
the Talent's signature block and Schedule 2, and Asha's signature image in Mode Society's signature
block (the contract's clause 17: signed in advance). Upload the results to Drive → Contracts and open
each with Google Docs (File → Save as Google Docs), named as src/lib/contract.ts templateName says.

The field ids must match src/lib/contract.ts (SCHEDULE_1, SIGN_FIELDS, PART_A, PART_B).

    python scripts/build-contract-templates.py <Asha's pack folder> <signature.png> <output folder>

Needs python-docx. The signature never goes in this repo (it's public): keep it and the output in
the private Drive only.
"""
import re
import sys
from pathlib import Path

from docx import Document
from docx.shared import Cm, Pt, RGBColor

PACK, SIGNATURE, OUT = (Path(a) for a in sys.argv[1:4])
FILES = {
    "Mode Society Exclusive Talent Agreement": "03_Mode_Society/Mode_Society_Exclusive_Talent_Agreement.docx",
    "Mode Society Non-Exclusive Talent Agreement": "03_Mode_Society/Mode_Society_Non-Exclusive_Talent_Agreement.docx",
    "Mode Society Tech Exclusive Talent Agreement": "04_Mode_Society_Tech/Mode_Society_Tech_Exclusive_Talent_Agreement.docx",
    "Mode Society Tech Non-Exclusive Talent Agreement": "04_Mode_Society_Tech/Mode_Society_Tech_Non-Exclusive_Talent_Agreement.docx",
}
ROLE = "Talent"
W = "_" * 40  # field width


def tag(kind, opt, required=True, width=W):
    star = "" if required else "*"
    return "{" + f"{kind}{star}:{ROLE}" + (f":{opt}" if opt else "") + width + "}"


# Schedule 1 and the Talent's block: label (start of the row's first cell) → tag
ROWS = [
    ("Full legal name", tag("t", "legalName")),
    ("Professional / creator name", tag("t", "creatorName")),
    ("Date of birth", tag("t", "dob")),
    ("Mobile", tag("t", "mobile")),
    ("Personal email", tag("t", "email")),
    ("Country of residence", tag("t", "country")),
    ("State / region", tag("t", "region")),
    ("Postal address for PR packages", tag("t", "postal")),
    ("Main platform & link", tag("t", "mainChannel")),
    ("Other platforms & links", tag("t", "otherChannels", False)),
    ("Emergency contact", tag("t", "emergency")),
    ("Parent / guardian", tag("t", "guardian", False)),
    # Part A
    ("Account name", tag("t", "accountName")),
    ("Bank name", None),  # both parts have one: handled below
    ("BSB", tag("t", "bsb", width="_" * 16)),
    ("Account number", tag("t", "accountNumber")),
    ("ABN", tag("t", "abn", False, "_" * 24)),
    ("Business / trading name", tag("t", "tradingName", False)),
    ("Registered for GST?", tag("dd", "gst", width="_" * 12)),
    ("Billing address", tag("t", "billingAddress", False)),
    # Part B
    ("Country of tax residence", tag("t", "taxCountry")),
    ("Tax ID number", tag("t", "taxId", False)),
    ("UAE residents only", tag("t", "uaePermit", False)),
    ("Payment method", tag("dd", "payMethod", width="_" * 30)),
    ("PayPal account email", tag("t", "paypalEmail", False)),
    ("Name on PayPal account", tag("t", "paypalName", False)),
    ("Account holder name", tag("t", "holderName", False)),
    ("Account holder address", tag("t", "holderAddress", False)),
    ("Bank address", tag("t", "bankAddress", False)),
    ("SWIFT / BIC code", tag("t", "swift", False)),
    ("IBAN (UK, UAE) or account number", tag("t", "iban", False)),
    ("US: ABA routing number", tag("t", "aba", False)),
    ("UK: sort code", tag("t", "sortCode", False)),
    ("Japan: bank code and branch code", tag("t", "jpCodes", False)),
    ("Account currency", tag("t", "currency", False)),
]


def set_text(cell, text, white=True):
    """Replaces a cell's text with one run (the tag), in white so only the PandaDoc field shows."""
    for p in cell.paragraphs[1:]:
        p._p.getparent().remove(p._p)
    p = cell.paragraphs[0]
    for r in p.runs:
        r._r.getparent().remove(r._r)
    run = p.add_run(text)
    run.font.size = Pt(9)
    if white:
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)


def build(name, src):
    doc = Document(PACK / src)
    # tables, in document order, with the section each one is in
    body = list(doc.element.body.iterchildren())
    section = part = None
    tables = iter(doc.tables)
    for el in body:
        kind = el.tag.split("}")[1]
        if kind == "p":
            text = "".join(t.text or "" for t in el.iter() if t.tag.endswith("}t"))
            if text.startswith("Signed for and on behalf of"):
                section = "ms"
            elif text.strip() == "Talent":
                section = "talent"
            elif text.startswith("Schedule 1"):
                section = "s1"
            elif text.startswith("Where are you based"):
                section = "chooser"
                # each contract states its own part, so there's nothing to choose
                runs = [r for r in el.iter() if r.tag.endswith("}t")]
                runs[0].text = "Where you're based"
                for r in runs[1:]:
                    r.text = ""
            elif text.startswith("Part A"):
                section, part = "s2", "A"
            elif text.startswith("Part B"):
                section, part = "s2", "B"
            elif text.startswith("[PandaDoc set-up note"):
                el.getparent().remove(el)
            continue
        if kind != "tbl":
            continue
        table = next(t for t in doc.tables if t._tbl is el)
        if section == "chooser":
            # the backend writes which part applies here ({{BASED}}); the other part is removed per contract
            rows = table.rows
            set_text(rows[0].cells[0], "{{BASED}}", white=False)
            for r in rows[1:]:
                r._tr.getparent().remove(r._tr)
            section = None
            continue
        for row in table.rows:
            if len(row.cells) < 2:
                continue
            label = row.cells[0].text.strip()
            value = row.cells[-1]
            if section == "ms":
                if label == "Signature":
                    set_text(value, "", white=False)
                    value.paragraphs[0].add_run().add_picture(str(SIGNATURE), height=Cm(1.1))
                elif label == "Date":
                    set_text(value, "The date the Talent signs", white=False)
                continue
            if section == "talent":
                if label == "Name":
                    set_text(value, tag("t", "signName"))
                elif label == "Signature":
                    set_text(value, tag("s", None, width="_" * 30))
                elif label == "Date":
                    set_text(value, tag("d", None, width="_" * 16))
                continue
            if label.startswith("Bank name"):
                set_text(value, tag("t", "bankName") if part == "A" else tag("t", "intlBankName", False))
                continue
            if label.startswith("ABN"):
                # the "I don't have an ABN" tick box becomes a PandaDoc checkbox
                cell = row.cells[0]
                t = cell.text.replace("[ ]", tag("c", "noAbn", False, ""))
                set_text(cell, t, white=False)
                set_text(value, tag("t", "abn", False, "_" * 24))
                continue
            for start, t in ROWS:
                if t and label.startswith(start):
                    set_text(value, t)
                    break
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f"{name}.docx"
    doc.save(out)
    # every tag that went in, for checking against src/lib/contract.ts
    import zipfile

    xml = zipfile.ZipFile(out).read("word/document.xml").decode()
    text = re.sub(r"<[^>]+>", "", xml)
    ids = re.findall(r"\{(\w+)\*?:" + ROLE + r"(?::(\w+))?_*\}", text)
    print(f"{name}: {len(ids)} tags:", ", ".join(i or k for k, i in ids))


for name, src in FILES.items():
    build(name, src)
