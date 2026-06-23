<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAI
{
    protected $apiKey;
    protected $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    /**
     * Analyze image and description to determine severity and tags
     */
    public function analyzeReport($imagePath, $description)
    {
        if (!$this->apiKey) {
            return $this->mockAnalyzeReport();
        }

        try {
            // Read image and encode to base64
            $fullPath = storage_path('app/public/' . $imagePath);
            if (!file_exists($fullPath)) {
                return $this->mockAnalyzeReport();
            }

            $imageData = base64_encode(file_get_contents($fullPath));
            $mimeType = mime_content_type($fullPath);

            $prompt = "Deskripsi dari warga: \"{$description}\"";

            $systemInstruction = "Kamu adalah sistem AI penganalisis infrastruktur publik (Jalan, Jembatan, Drainase). Tugasmu adalah menganalisis foto kerusakan dan deskripsi yang diberikan oleh warga, lalu menentukan tingkat keparahan (severity) dan memberikan tag otomatis (maksimal 3 tag). HANYA pilih severity: rendah, sedang, parah, atau kritis.";

            $payload = [
                'system_instruction' => [
                    'parts' => [
                        ['text' => $systemInstruction]
                    ]
                ],
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $imageData
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.0, // 0.0 untuk hasil paling cepat dan deterministik
                    'response_mime_type' => 'application/json',
                ]
            ];

            $response = Http::post($this->endpoint . '?key=' . $this->apiKey, $payload);

            if ($response->successful()) {
                $result = $response->json();
                $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                // Clean markdown if present
                $text = str_replace(['```json', '```'], '', $text);
                
                // Extract only the JSON block (from { to }) to ignore conversational padding
                preg_match('/\{.*\}/s', trim($text), $matches);
                if (!empty($matches)) {
                    $text = $matches[0];
                }
                
                $data = json_decode(trim($text), true);
                
                if (is_array($data) && isset($data['severity']) && isset($data['tags'])) {
                    return $data;
                }
            }

            Log::error('Gemini API Error: ' . $response->body());
            return $this->mockAnalyzeReport();

        } catch (\Exception $e) {
            Log::error('Gemini Exception: ' . $e->getMessage());
            return $this->mockAnalyzeReport();
        }
    }

    /**
     * Summarize a list of reports into a single paragraph
     */
    public function summarizeReports($reportsData)
    {
        if (!$this->apiKey) {
            return "Sistem AI saat ini dinonaktifkan (API Key belum diatur).";
        }

        try {
            $prompt = "Kamu adalah asisten analis infrastruktur wilayah. 
Berikut adalah daftar keluhan warga (format: ID - Kategori - Deskripsi - Status - Severity):
{$reportsData}

Buatkan 1 paragraf singkat (maksimal 3 kalimat) yang merangkum masalah utama di area ini dan memberikan satu rekomendasi tindakan prioritas. Gunakan bahasa Indonesia formal dan lugas.";

            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ];

            $response = Http::post($this->endpoint . '?key=' . $this->apiKey, $payload);

            if ($response->successful()) {
                $result = $response->json();
                return trim($result['candidates'][0]['content']['parts'][0]['text'] ?? 'Gagal menghasilkan ringkasan.');
            }

            if ($response->status() === 503) {
                return "Layanan AI sedang mengalami lonjakan antrean dari server Google. Mohon tunggu beberapa menit dan coba lagi.";
            }

            return "Gagal dari API Google: " . $response->body();
        } catch (\Exception $e) {
            return "Terjadi kesalahan sistem: " . $e->getMessage();
        }
    }

    /**
     * Fallback mock if API key is not set
     */
    protected function mockAnalyzeReport()
    {
        return [
            'severity' => 'belum_dinilai',
            'tags' => ['Otomatisasi Nonaktif']
        ];
    }
}
