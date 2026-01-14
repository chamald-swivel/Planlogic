import { AzureBlobService } from "./azure-blob-service"
import { AzureSpeechService } from "./azure-speech-service"

/**
 * Audio Transcription Service
 * Orchestrates uploading audio to Blob Storage and batch transcription.
 */
export class AudioTranscriptionService {
  static async uploadAndTranscribe(
    file: File,
    options: { locale?: string } = {}
  ): Promise<{
    text: string
    blobUrl: string
    transcriptionId: string
  }> {
    const { locale = "en-US" } = options

    // 1) Upload audio to Blob Storage
    const { blobUrl } = await AzureBlobService.uploadFile(file)

    // 2) Get SAS URL (assumes token is a User Delegation SAS)
    const { sasUrl } = AzureBlobService.getUserDelegationSas(blobUrl)

    // 3) Start batch transcription
    const { transcriptionId } = await AzureSpeechService.startBatchTranscription({
      sasUrl,
      locale,
      displayName: file.name,
    })

    // 4) Poll until completion and retrieve text
    const text = await this.pollForTranscriptText(transcriptionId)

    return { text, blobUrl, transcriptionId }
  }

  private static async pollForTranscriptText(
    transcriptionId: string,
    pollIntervalMs = 5000,
    timeoutMs = 300000
  ): Promise<string> {
    const start = Date.now()

    while (Date.now() - start < timeoutMs) {
      const status = await AzureSpeechService.getTranscriptionStatus(transcriptionId)

      if (status.status === "Succeeded") {
        return AzureSpeechService.getTranscriptText(transcriptionId)
      }

      if (status.status === "Failed") {
        throw new Error("Azure Speech transcription failed. Check the audio file and try again.")
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    }

    throw new Error("Transcription polling timed out. Please try again later.")
  }
}
