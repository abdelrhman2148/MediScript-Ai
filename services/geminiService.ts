import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PrescriptionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const prescriptionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    document_type: { type: Type.STRING },
    issue_date: { type: Type.STRING, description: "YYYY-MM-DD", nullable: true },
    patient: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, nullable: true },
        dob: { type: Type.STRING, description: "YYYY-MM-DD", nullable: true },
        hcn: { type: Type.STRING, nullable: true },
        address: { type: Type.STRING, nullable: true }
      }
    },
    prescriber: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, nullable: true },
        license_id: { type: Type.STRING, nullable: true },
        clinic_name: { type: Type.STRING, nullable: true },
        phone: { type: Type.STRING, nullable: true },
        fax: { type: Type.STRING, nullable: true }
      }
    },
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drug_name: { type: Type.STRING, nullable: true },
          strength: { type: Type.STRING, nullable: true },
          form: { type: Type.STRING, description: "e.g. TAB, CAP, CRM", nullable: true },
          sig_instructions: { type: Type.STRING, nullable: true },
          quantity: { type: Type.STRING, nullable: true },
          refills: { type: Type.STRING, nullable: true },
          din: { type: Type.STRING, nullable: true },
          fill_date: { type: Type.STRING, description: "YYYY-MM-DD", nullable: true }
        }
      }
    }
  },
  required: ["document_type", "patient", "prescriber", "medications"]
};

// In a real implementation, this would be dynamically fetched from the Vector DB
const SIMULATED_RAG_MEMORY = `
--- EXAMPLE 1 (Transfer Report) ---
INPUT TEXT: "RX TRANSFER REPORT... Patient: Jane Doe... Drug: Amoxicillin 500mg... Qty: 21"
CORRECT JSON: {
  "document_type": "Transfer Report",
  "issue_date": "2023-10-10",
  "patient": { "name": "Jane Doe", "dob": "1980-01-01", "hcn": "1234567890", "address": "123 Main St" },
  "prescriber": { "name": "Dr. Smith", "license_id": "98765", "clinic_name": "City Clinic", "phone": "555-1234", "fax": "555-5678" },
  "medications": [{ "drug_name": "Amoxicillin", "strength": "500mg", "form": "CAP", "sig_instructions": "Take one capsule three times daily", "quantity": "21", "refills": "0", "din": "123456", "fill_date": "2023-10-09" }]
}
`;

export const extractPrescriptionData = async (base64Pdf: string): Promise<PrescriptionData> => {
  try {
    const systemInstruction = `You are an expert Medical Documentation AI. Your job is to extract prescription data from scanned PDF images into a strict JSON format.

### INPUT CONTEXT
You will be provided with:
1. An image of a medical document (Prescription, Transfer Report, or Fax).
2. (Optional) Text from similar past documents to guide your extraction style.

### EXTRACTION RULES
1. **Redactions:** The input images contain black boxes (redactions) covering Patient Names and Addresses. 
   - If a field is visually redacted, set the JSON value to null.
   - DO NOT make up names. 
2. **Noise Removal:** Ignore fax headers/footers (e.g., "Received from Fax Unite", "Printed at Purehealth"). Focus on the original clinical content.
3. **Handwriting:** Transcribe handwritten instructions (Sig) and drug names accurately.
4. **Multiple Medications:** If a document lists multiple drugs (like a Transfer Report or multi-script), extract ALL of them into the \`medications\` array.
5. **Document Type:** Identify if it is a "New Prescription", "Refill Request", "Transfer Report", or "Fax Cover".

### REFERENCE EXAMPLES (LEARNED MEMORY)
The following are examples of how similar documents were processed in the past. Use them to understand how to handle specific layouts:

${SIMULATED_RAG_MEMORY}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf
            }
          },
          {
            text: "Analyze the provided medical document image and extract the data into the JSON schema."
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: prescriptionSchema,
        temperature: 0.1
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    const extractedData = JSON.parse(text);
    
    return {
      ...extractedData,
      status: 'pending',
      createdAt: Date.now()
    };

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract prescription data.");
  }
};