/**
 * Azure Speech Services (Batch Transcription)
 * Handles transcription creation and result retrieval.
 *
 * Requires:
 * - NEXT_PUBLIC_AZURE_SPEECH_KEY
 * - NEXT_PUBLIC_AZURE_SPEECH_REGION (e.g., "eastus")
 */
export class AzureSpeechService {
  private static get speechKey() {
    return process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
  }

  private static get speechRegion() {
    return process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;
  }

  private static ensureConfig() {
    if (!this.speechKey || !this.speechRegion) {
      throw new Error(
        "Azure Speech Service is not configured. Please set NEXT_PUBLIC_AZURE_SPEECH_KEY and NEXT_PUBLIC_AZURE_SPEECH_REGION."
      );
    }
  }

  private static get apiBase() {
    return `https://${this.speechRegion}.api.cognitive.microsoft.com/speechtotext/v3.2`;
  }

  private static authHeaders() {
    return {
      "Ocp-Apim-Subscription-Key": this.speechKey || "",
      "Content-Type": "application/json",
    };
  }

  static async startBatchTranscription({
    sasUrl,
    locale = "en-US",
    displayName = "Batch Transcription",
  }: {
    sasUrl: string;
    locale?: string;
    displayName?: string;
  }): Promise<{ transcriptionId: string }> {
    this.ensureConfig();

    const response = await fetch(`${this.apiBase}/transcriptions`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify({
        displayName,
        description: "Audio transcription request",
        locale,
        contentUrls: [sasUrl],
        properties: {
          wordLevelTimestampsEnabled: false,
          diarizationEnabled: false,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Failed to start transcription: ${response.status} ${response.statusText} - ${text}`
      );
    }

    // The API returns a Location header containing the transcription ID.
    const location = response.headers.get("location");
    const transcriptionId = location?.split("/").pop();
    if (!transcriptionId) {
      throw new Error(
        "Unable to retrieve transcription ID from Azure Speech response."
      );
    }

    return { transcriptionId };
  }

  static async getTranscriptionStatus(transcriptionId: string): Promise<{
    status: string;
    links?: { files?: string };
    properties?: Record<string, unknown>;
  }> {
    this.ensureConfig();
    const response = await fetch(
      `${this.apiBase}/transcriptions/${transcriptionId}`,
      {
        headers: this.authHeaders(),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Failed to fetch transcription status: ${response.status} ${response.statusText} - ${text}`
      );
    }

    return response.json();
  }

  static async getTranscriptText(transcriptionId: string): Promise<string> {
    const status = await this.getTranscriptionStatus(transcriptionId);
    const filesLink = status.links?.files;

    if (!filesLink) {
      throw new Error("No files link returned from transcription status.");
    }

    const filesResponse = await fetch(filesLink, {
      headers: this.authHeaders(),
    });
    if (!filesResponse.ok) {
      const text = await filesResponse.text().catch(() => "Unknown error");
      throw new Error(
        `Failed to fetch transcription files: ${filesResponse.status} ${filesResponse.statusText} - ${text}`
      );
    }

    const filesPayload = await filesResponse.json();
    const transcriptionFile = (filesPayload.values || []).find(
      (file: any) =>
        file.kind === "Transcription" ||
        file.properties?.["role"] === "Transcription" ||
        file.name?.toLowerCase().includes("transcription")
    );

    const contentUrl = transcriptionFile?.links?.contentUrl;
    if (!contentUrl) {
      throw new Error("No transcription content URL found.");
    }

    const contentResponse = await fetch(contentUrl);
    if (!contentResponse.ok) {
      const text = await contentResponse.text().catch(() => "Unknown error");
      throw new Error(
        `Failed to download transcription content: ${contentResponse.status} ${contentResponse.statusText} - ${text}`
      );
    }

    const contentJson = await contentResponse.json().catch(() => null);
    if (contentJson?.combinedRecognizedPhrases?.length) {
      return contentJson.combinedRecognizedPhrases
        .map((p: any) => p?.display || p?.lexical || "")
        .filter(Boolean)
        .join("\n");
    }

    const textContent = await contentResponse.text();
    return textContent || "No transcription text found.";
  }
}
