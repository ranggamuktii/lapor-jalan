<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    private string $apiKey;
    private string $modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY', '');
    }

    /**
     * Call Gemini API with a prompt
     */
    private function callGemini(string $prompt, bool $jsonResponse = true): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('GEMINI_API_KEY is not set. Using mocked AI response.');
            return null;
        }

        try {
            $payload = [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ];

            if ($jsonResponse) {
                // Hint Gemini to return JSON
                $payload['generationConfig'] = [
                    'responseMimeType' => 'application/json',
                ];
            }

            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post($this->modelUrl . '?key=' . $this->apiKey, $payload);

            if ($response->successful()) {
                return $response->json('candidates.0.content.parts.0.text');
            }

            if ($response->status() === 503) {
                return "Layanan AI sedang sibuk (kapasitas penuh). Mohon coba beberapa saat lagi.";
            }

            if ($response->status() === 429) {
                return "Kuota API gratis Anda telah habis atau model ini tidak tersedia untuk kuota gratis Anda.";
            }

            Log::error('Gemini API Error: ' . $response->body());
            return "Error dari API Google: " . $response->body();
        } catch (\Exception $e) {
            Log::error('Gemini Request Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Evaluate severity of a report. Returns an array with 'score' (0-100) and 'summary'
     */
    public function evaluateSeverity(string $description, string $category): array
    {
        $prompt = "You are an AI infrastructure analyst. Analyze this citizen report to determine its severity score (0 to 100) and provide a 1-sentence summary.\n" .
                  "Category: {$category}\n" .
                  "Description: {$description}\n" .
                  "Respond strictly in JSON format: {\"score\": 85, \"summary\": \"Huge pothole causing traffic accidents\"}";

        $result = $this->callGemini($prompt, true);

        if ($result) {
            $data = json_decode($result, true);
            if (isset($data['score'])) {
                return [
                    'score' => (int) $data['score'],
                    'summary' => $data['summary'] ?? 'Dianalisis oleh AI'
                ];
            }
        }

        // Mock response if API fails or no key
        $score = rand(30, 95);
        $summary = "[$category] " . substr($description, 0, 50) . "... (Skor acak karena API Key belum diset)";
        if (str_contains(strtolower($description), 'parah') || str_contains(strtolower($description), 'kecelakaan')) {
            $score = rand(85, 100);
        }

        return [
            'score' => $score,
            'summary' => $summary
        ];
    }

    /**
     * Check if a new report is a duplicate of existing reports nearby.
     */
    public function checkDuplicate(string $newDescription, array $existingDescriptions): ?int
    {
        if (empty($existingDescriptions)) {
            return null;
        }

        // Prepare existing reports for prompt
        $existingText = "";
        foreach ($existingDescriptions as $id => $desc) {
            $existingText .= "ID {$id}: {$desc}\n";
        }

        $prompt = "You are a duplicate detection AI. A citizen just submitted a new report.\n" .
                  "New Report: {$newDescription}\n\n" .
                  "Here are recent reports in the exact same 50-meter radius:\n{$existingText}\n" .
                  "Determine if the New Report is referring to the EXACT same physical infrastructure issue as any of the existing reports.\n" .
                  "Respond strictly in JSON format: {\"is_duplicate\": true, \"duplicate_of_id\": 123} OR {\"is_duplicate\": false, \"duplicate_of_id\": null}";

        $result = $this->callGemini($prompt, true);

        if ($result) {
            $data = json_decode($result, true);
            if (isset($data['is_duplicate']) && $data['is_duplicate'] && isset($data['duplicate_of_id'])) {
                return (int) $data['duplicate_of_id'];
            }
        }

        // Mock response: Just return null (no duplicate) if API is not set.
        return null;
    }

    /**
     * Generate weekly summary text.
     */
    public function generateWeeklySummary(array $stats): string
    {
        $statsJson = json_encode($stats);
        $prompt = "Write a 3-paragraph executive summary in Indonesian based on these weekly infrastructure report statistics: {$statsJson}. Be professional, concise, and highlight the most problematic areas or categories.";

        $result = $this->callGemini($prompt, false);

        if ($result) {
            return $result;
        }

        return "Berdasarkan statistik minggu ini, terdapat {$stats['total_reports']} laporan masuk. Kategori terbanyak adalah {$stats['top_category']} dengan wilayah paling terdampak di {$stats['top_district']}. Tim kami sedang mempercepat proses validasi dan perbaikan. (Contoh teks otomatis karena API Key belum diset).";
    }
}
