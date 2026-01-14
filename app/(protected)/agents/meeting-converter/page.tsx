"use client";

import { useState, useEffect } from "react";
import { Card, Title, Text } from "@tremor/react";
import { AtomButton } from "@/components/atoms/button";
import { useRouter } from "next/navigation";
import {
  RiArrowLeftLine,
  RiUploadCloud2Line,
  RiFolderLine,
} from "@remixicon/react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import type {
  ClientReport,
  BuckleReport,
  MoscowReport,
  BateReport,
  TableSection,
} from "../../../../types/report";
import AudioUploader from "@/components/templates/audio-uploader";

interface OneDriveFolder {
  id: string;
  name: string;
}

interface FolderBreadcrumb {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

export default function MeetingConverterPage() {
  const router = useRouter();
  const { instance, accounts } = useMsal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [folders, setFolders] = useState<OneDriveFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("root");
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<
    FolderBreadcrumb[]
  >([{ id: "root", name: "Root" }]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [clients, setClients] = useState<Client[]>([
    { id: "moscow", name: "Moscow" },
    { id: "bate", name: "Bate" },
    { id: "buckle", name: "Buckle" },
  ]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ClientReport | null>(
    null
  );
  const [reportError, setReportError] = useState<string | null>(null);

  // Fetch OneDrive folders on component mount
  useEffect(() => {
    fetchOneDriveFolders("root");
  }, []);

  const fetchOneDriveFolders = async (folderId: string = "root") => {
    if (!accounts.length) return;

    try {
      setIsLoadingFolders(true);
      const tokenRequest = {
        scopes: ["Files.Read", "Files.ReadWrite"],
        account: accounts[0],
      };

      let tokenResponse;
      try {
        tokenResponse = await instance.acquireTokenSilent(tokenRequest);
      } catch (error) {
        // If silent token acquisition fails due to consent requirement, use popup
        if (error instanceof InteractionRequiredAuthError) {
          tokenResponse = await instance.acquireTokenPopup({
            scopes: ["Files.Read", "Files.ReadWrite"],
            account: accounts[0],
          });
        } else {
          throw error;
        }
      }

      // Get folders from specified folder
      const endpoint =
        folderId === "root"
          ? "https://graph.microsoft.com/v1.0/me/drive/root/children"
          : `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only folders from the response
        const folderList: OneDriveFolder[] = (data.value || [])
          .filter((item: any) => item.folder)
          .map((item: any) => ({
            id: item.id,
            name: item.name,
          }));
        setFolders(folderList);
        setCurrentFolderId(folderId);
        setSelectedFolderId(folderId);
      } else {
        console.error(
          "Failed to fetch folders:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleNavigateIntoFolder = (folderId: string, folderName: string) => {
    // Update breadcrumbs
    setFolderBreadcrumbs([
      ...folderBreadcrumbs,
      { id: folderId, name: folderName },
    ]);
    // Fetch subfolders
    fetchOneDriveFolders(folderId);
  };

  const handleNavigateToFolder = (
    folderId: string,
    breadcrumbIndex: number
  ) => {
    // Slice breadcrumbs to the selected level
    setFolderBreadcrumbs(folderBreadcrumbs.slice(0, breadcrumbIndex + 1));
    // Fetch folders at that level
    fetchOneDriveFolders(folderId);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (audio, video, or documents)
      const validTypes = [
        "audio/",
        "video/",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const isValid = validTypes.some((type) => file.type.startsWith(type));

      if (isValid) {
        setSelectedFile(file);
        setUploadMessage(null);
      } else {
        setUploadMessage({
          type: "error",
          text: "Please upload a valid file (audio, video, PDF, DOCX, or TXT)",
        });
        setSelectedFile(null);
      }
    }
  };

  const handleTranscriptFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type for transcript (documents preferred)
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "audio/",
        "video/",
      ];
      const isValid = validTypes.some((type) => file.type.startsWith(type));

      if (isValid) {
        setTranscriptFile(file);
      } else {
        alert("Please upload a valid file (PDF, DOCX, TXT, audio, or video)");
        setTranscriptFile(null);
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!transcriptFile || !selectedClientId) return;

    try {
      setIsGeneratingReport(true);
      setReportError(null);
      setGeneratedReport(null);

      // Create FormData with file and client
      const formData = new FormData();
      formData.append("file", transcriptFile);
      formData.append("client", selectedClientId);

      // Get the API endpoint from environment
      const apiEndpoint = process.env.NEXT_PUBLIC_REPORT_GENERATE_API_CALL;
      if (!apiEndpoint) {
        throw new Error("Report generation API endpoint not configured");
      }

      console.log("Calling report generation API...", {
        client: selectedClientId,
        file: transcriptFile.name,
      });

      // Call the report generation API
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `API error: ${response.status} ${response.statusText}`
        );
      }

      const reportData: ClientReport = await response.json();
      console.log("Report generated successfully:", reportData);
      setGeneratedReport(reportData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate report";
      console.error("Report generation error:", error);
      setReportError(errorMessage);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleUploadAndSave = async () => {
    if (!selectedFile || !accounts.length) return;

    try {
      setIsUploading(true);
      setUploadMessage(null);

      // Get access token for Microsoft Graph API
      const tokenRequest = {
        scopes: ["Files.ReadWrite"],
        account: accounts[0],
      };

      let tokenResponse;
      try {
        tokenResponse = await instance.acquireTokenSilent(tokenRequest);
      } catch (error) {
        // If silent token acquisition fails due to consent requirement, use popup
        if (error instanceof InteractionRequiredAuthError) {
          tokenResponse = await instance.acquireTokenPopup({
            scopes: ["Files.ReadWrite"],
            account: accounts[0],
          });
        } else {
          throw error;
        }
      }

      // Determine the upload path based on selected folder
      let uploadUrl: string;
      if (selectedFolderId === "root") {
        uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(
          selectedFile.name
        )}:/content`;
      } else {
        uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${selectedFolderId}:/${encodeURIComponent(
          selectedFile.name
        )}:/content`;
      }

      // Upload file to OneDrive via Microsoft Graph API
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
          "Content-Type": selectedFile.type || "application/octet-stream",
        },
        body: selectedFile,
      });

      if (uploadResponse.ok) {
        const folderName =
          selectedFolderId === "root"
            ? "OneDrive root folder"
            : folders.find((f) => f.id === selectedFolderId)?.name ||
              "selected folder";

        setUploadMessage({
          type: "success",
          text: `File "${selectedFile.name}" uploaded successfully to ${folderName}!`,
        });
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById(
          "file-input"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const errorText = await uploadResponse.text();
        console.error(
          "Upload response error:",
          uploadResponse.status,
          errorText
        );
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage({
        type: "error",
        text: "Failed to upload file to OneDrive. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <RiArrowLeftLine className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 p-8 mb-8">
          <div className="space-y-3">
            <Title className="text-3xl font-bold text-slate-900">
              Meeting to File Note Converter
            </Title>
            <Text className="text-lg text-slate-700">
              Upload your meeting recording or document to automatically convert
              it into organized file notes
            </Text>
          </div>
        </Card>

        {/* Upload Card */}
        <Card className="border border-slate-200 p-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              Upload Your File
            </h2>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <RiUploadCloud2Line className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-900 font-medium">
                    Drag and drop your file here
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    or click to browse
                  </p>
                </div>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept="audio/*,video/*,.pdf,.docx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById("file-input")?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Supported Formats
              </p>
              <p className="text-sm text-slate-600">
                Audio: MP3, WAV, M4A | Video: MP4, MOV, AVI | Documents: PDF,
                DOCX, TXT
              </p>
            </div>

            {/* Folder Selection */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  <RiFolderLine className="inline-block w-4 h-4 mr-2" />
                  Select OneDrive Folder
                </p>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  {folderBreadcrumbs.map((breadcrumb, index) => (
                    <div
                      key={breadcrumb.id}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={() =>
                          handleNavigateToFolder(breadcrumb.id, index)
                        }
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {breadcrumb.name}
                      </button>
                      {index < folderBreadcrumbs.length - 1 && (
                        <span className="text-slate-400">/</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Folders List */}
                <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
                  {isLoadingFolders ? (
                    <div className="p-4 text-center text-slate-600">
                      Loading folders...
                    </div>
                  ) : folders.length === 0 ? (
                    <div className="p-4 text-center text-slate-600">
                      No folders found in this location
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="radio"
                                id={`folder-${folder.id}`}
                                name="folder"
                                value={folder.id}
                                checked={selectedFolderId === folder.id}
                                onChange={(e) =>
                                  setSelectedFolderId(e.target.value)
                                }
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor={`folder-${folder.id}`}
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                              >
                                <RiFolderLine className="w-4 h-4 text-yellow-500" />
                                <span className="text-slate-900 font-medium">
                                  {folder.name}
                                </span>
                              </label>
                            </div>
                            <button
                              onClick={() =>
                                handleNavigateIntoFolder(folder.id, folder.name)
                              }
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                            >
                              Open →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-900">
                  Selected File:{" "}
                  <span className="text-blue-600">{selectedFile.name}</span>
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* Upload Message */}
            {uploadMessage && (
              <div
                className={`rounded-lg p-4 ${
                  uploadMessage.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    uploadMessage.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {uploadMessage.text}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <AtomButton
                onClick={handleUploadAndSave}
                disabled={!selectedFile || isUploading}
                size="md"
                className="flex-1"
              >
                {isUploading ? "Uploading..." : "Upload to OneDrive"}
              </AtomButton>
              {selectedFile && (
                <AtomButton
                  onClick={() => {
                    setSelectedFile(null);
                    const fileInput = document.getElementById(
                      "file-input"
                    ) as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                  variant="secondary"
                  size="md"
                >
                  Clear
                </AtomButton>
              )}
            </div>
          </div>
        </Card>

        {/* Client Selection Card */}
        <Card className="border border-slate-200 p-8 mt-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              Select Client & Generate Report
            </h2>

            {/* Transcript File Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <RiUploadCloud2Line className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-900 font-medium">
                    Upload your transcript here
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    or click to browse
                  </p>
                </div>
                <input
                  id="transcript-file-input"
                  type="file"
                  onChange={handleTranscriptFileSelect}
                  accept="audio/*,video/*,.pdf,.docx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() =>
                    document.getElementById("transcript-file-input")?.click()
                  }
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {/* Selected Transcript File Display */}
            {transcriptFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-900">
                  Transcript File:{" "}
                  <span className="text-blue-600">{transcriptFile.name}</span>
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Size: {(transcriptFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* Client Selection */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  <RiFolderLine className="inline-block w-4 h-4 mr-2" />
                  Select Client
                </p>

                {/* Clients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedClientId === client.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`client-${client.id}`}
                          name="client"
                          value={client.id}
                          checked={selectedClientId === client.id}
                          onChange={() => setSelectedClientId(client.id)}
                          className="w-4 h-4 mr-3"
                        />
                        <label
                          htmlFor={`client-${client.id}`}
                          className="flex-1 font-medium text-slate-900 cursor-pointer"
                        >
                          {client.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Client Display */}
            {selectedClientId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-900">
                  Selected Client:{" "}
                  <span className="text-blue-600">
                    {clients.find((c) => c.id === selectedClientId)?.name}
                  </span>
                </p>
              </div>
            )}

            {/* Generate Report Button */}
            <div className="pt-4">
              <AtomButton
                onClick={handleGenerateReport}
                disabled={
                  !transcriptFile || !selectedClientId || isGeneratingReport
                }
                size="md"
                className="w-full"
              >
                {isGeneratingReport ? "Generating..." : "Generate the Report"}
              </AtomButton>
            </div>

            {/* Error Message */}
            {reportError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">
                  Error generating report:
                </p>
                <p className="text-sm text-red-700 mt-1">{reportError}</p>
              </div>
            )}

            {/* Info Text */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">
                {isGeneratingReport
                  ? "Please wait while your report is being generated. This may take 1-2 minutes..."
                  : "Make sure you have uploaded your transcript file and selected a client before generating the report."}
              </p>
            </div>
          </div>
        </Card>

        {/* Generated Report Card */}
        {generatedReport && (
          <Card className="border border-slate-200 p-8 mt-8">
            <div className="space-y-8">
              <div>
                <Title className="text-2xl font-bold text-slate-900 mb-2">
                  Generated Report
                </Title>
                <p className="text-sm text-slate-600">
                  Client:{" "}
                  <span className="font-medium text-slate-900">
                    {selectedClientId.toUpperCase()}
                  </span>
                </p>
              </div>

              {/* Report Content - Render based on report structure */}
              <div className="space-y-8">
                {Object.entries(generatedReport).map(([key, value]) => {
                  // Skip index signatures or empty values
                  if (
                    !value ||
                    (typeof value === "object" && !Object.keys(value).length)
                  ) {
                    return null;
                  }

                  // Render text sections
                  if (typeof value === "string") {
                    return (
                      <div key={key} className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h3>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {value}
                        </p>
                      </div>
                    );
                  }

                  // Render table sections
                  if (
                    typeof value === "object" &&
                    !Array.isArray(value) &&
                    "columns" in value &&
                    Array.isArray(value.columns) &&
                    "rows" in value &&
                    Array.isArray(value.rows)
                  ) {
                    const tableValue = value as TableSection;
                    return (
                      <div key={key} className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h3>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                          <table className="w-full text-sm bg-white">
                            <thead className="bg-slate-100 border-b border-slate-200">
                              <tr>
                                {tableValue.columns.map((col) => (
                                  <th
                                    key={col}
                                    className="px-4 py-3 text-left font-semibold text-slate-900 whitespace-nowrap"
                                  >
                                    {String(col)
                                      .replace(/([A-Z])/g, " $1")
                                      .trim()}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableValue.rows && tableValue.rows.length > 0 ? (
                                tableValue.rows.map((row, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                                  >
                                    {tableValue.columns.map((col) => (
                                      <td
                                        key={`${idx}-${col}`}
                                        className="px-4 py-3 text-slate-700"
                                      >
                                        {String(row[col] || "-")}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={tableValue.columns.length}
                                    className="px-4 py-3 text-center text-slate-500"
                                  >
                                    No data available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {tableValue.totals &&
                          Object.keys(tableValue.totals).length > 0 && (
                            <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-200">
                              <p className="text-sm font-semibold text-slate-900 mb-3">
                                Totals
                              </p>
                              {Object.entries(tableValue.totals).map(
                                ([totalKey, totalValue]) => (
                                  <div
                                    key={totalKey}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-slate-700">
                                      {String(totalKey)
                                        .replace(/([A-Z])/g, " $1")
                                        .trim()}
                                      :
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                      {String(totalValue)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    );
                  }

                  // Render group/choice sections (objects without columns property)
                  if (
                    typeof value === "object" &&
                    !Array.isArray(value) &&
                    !("rows" in value)
                  ) {
                    return (
                      <div key={key} className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-200">
                          {Object.entries(value).map(
                            ([fieldKey, fieldValue]) => (
                              <div
                                key={fieldKey}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-slate-600 capitalize">
                                  {String(fieldKey)
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                                  :
                                </span>
                                <span className="text-slate-900 font-medium">
                                  {String(fieldValue)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <AtomButton
                  onClick={() => {
                    // TODO: Implement download/print functionality
                    console.log("Download report");
                  }}
                  size="md"
                  className="flex-1"
                >
                  Download Report
                </AtomButton>
                <AtomButton
                  onClick={() => {
                    setGeneratedReport(null);
                    setTranscriptFile(null);
                    setSelectedClientId("");
                  }}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                >
                  Generate New Report
                </AtomButton>
              </div>
            </div>
          </Card>
        )}
        <Card className="border border-slate-200 p-8 mt-8">
          <AudioUploader />
        </Card>
      </div>
    </div>
  );
}
