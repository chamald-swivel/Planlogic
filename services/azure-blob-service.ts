/**
 * Azure Blob Storage Service
 * Handles browser-based uploads using a pre-configured SAS token.
 *
 * Note: The SAS token should be a User Delegation SAS (or account SAS)
 * provided via environment variables. Never expose your storage account key
 * directly in client code.
 */
export class AzureBlobService {
  private static get account() {
    return process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT
  }

  private static get container() {
    return process.env.NEXT_PUBLIC_AZURE_STORAGE_CONTAINER
  }

  private static get sasToken() {
    return process.env.NEXT_PUBLIC_AZURE_STORAGE_SAS_TOKEN
  }

  private static ensureConfig() {
    if (!this.account || !this.container || !this.sasToken) {
      throw new Error(
        "Azure Blob Storage is not configured. Please set NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT, NEXT_PUBLIC_AZURE_STORAGE_CONTAINER, and NEXT_PUBLIC_AZURE_STORAGE_SAS_TOKEN."
      )
    }
  }

  private static getBaseBlobUrl(blobName: string) {
    return `https://${this.account}.blob.core.windows.net/${this.container}/${blobName}`
  }

  private static withSas(url: string) {
    const token = this.sasToken || ""
    const trimmedToken = token.startsWith("?") ? token.substring(1) : token
    return `${url}?${trimmedToken}`
  }

  /**
   * Upload a file to Blob Storage using a SAS URL.
   * Returns the blob URL without SAS for downstream usage.
   */
  static async uploadFile(file: File): Promise<{ blobUrl: string; blobName: string }> {
    this.ensureConfig()
    const blobName = `${Date.now()}-${encodeURIComponent(file.name)}`
    const sasUrl = this.withSas(this.getBaseBlobUrl(blobName))

    const response = await fetch(sasUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown upload error")
      throw new Error(
        `Failed to upload audio to Blob Storage: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    return { blobUrl: this.getBaseBlobUrl(blobName), blobName }
  }

  /**
   * Append the configured SAS token to a blob URL.
   * Assumes the configured SAS is a User Delegation SAS (or equivalent).
   */
  static getUserDelegationSas(blobUrl: string) {
    this.ensureConfig()
    return { sasUrl: this.withSas(blobUrl) }
  }
}
