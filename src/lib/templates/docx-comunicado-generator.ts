import { generateDocumentDocx, UniversalDocumentMetadata } from "./docx-document-generator";

export * from "./docx-document-generator";

export async function generateComunicadoDocx(text: string, metadata: UniversalDocumentMetadata): Promise<Blob> {
  return generateDocumentDocx("comunicado", text, metadata);
}

