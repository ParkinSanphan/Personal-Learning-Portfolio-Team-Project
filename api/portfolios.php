<?php
require_once 'storage.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. โหลดข้อมูลทั้งหมด
if ($method === 'GET') {
    sendJson(readPortfolios());
}

// 2. รับข้อมูลจากฟอร์ม (POST)
if ($method === 'POST') {
    $action = $_POST['action'] ?? '';
    $portfolios = readPortfolios(); // ฟังก์ชันจะเรียก lockData() ให้อัตโนมัติ

    // --- กรณีที่ 1: สร้าง Profile ใหม่  ---
    if ($action === 'create_profile') {
        $name = trim($_POST['displayName'] ?? '');

        if ($name === '') {
            sendJson(['error' => 'Display name is required'], 400);
        }

        $portfolio = [
            'id'                 => uniqid('p'),
            'displayName'        => $name,
            'email'              => trim($_POST['email'] ?? ''),
            'phone'              => trim($_POST['phone'] ?? ''),
            'whatIEnjoy'         => trim($_POST['whatIEnjoy'] ?? ''),
            'whatIveTried'       => trim($_POST['whatIveTried'] ?? ''),
            'whatImCuriousAbout' => trim($_POST['whatImCuriousAbout'] ?? ''),
            'items'              => [],
        ];

        $portfolios[] = $portfolio; // ต่อท้าย Array เดิม
        writePortfolios($portfolios);

        // ส่งข้อมูลทั้งหมด + ID ใหม่กลับไปให้ JS อัปเดตหน้าจอ
        sendJson([
            'status'     => 'success',
            'newId'      => $portfolio['id'],
            'portfolios' => $portfolios
        ]);
    }

    // --- กรณีที่ 2: เพิ่มผลงาน (Item) เข้าไปใน Profile ที่เลือกอยู่ ---
    if ($action === 'add_item') {
        $portfolioId = trim($_POST['portfolioId'] ?? '');
        $title = trim($_POST['title'] ?? '');

        if ($portfolioId === '') {
            sendJson(['error' => 'Please select or create a profile first'], 400);
        }
        if ($title === '') {
            sendJson(['error' => 'Item title is required'], 400);
        }

        // ค้นหาเจ้าของ Portfolio
        $foundIndex = -1;
        foreach ($portfolios as $index => $p) {
            if ($p['id'] === $portfolioId) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex === -1) {
            sendJson(['error' => 'Portfolio not found'], 404);
        }

        // แปลงข้อความคั่นด้วยลูกน้ำเป็น Array
        $skills = array_values(array_filter(array_map('trim', explode(',', $_POST['skills'] ?? ''))));
        $evidence = array_values(array_filter(array_map('trim', explode(',', $_POST['evidence'] ?? ''))));

        $newItem = [
            'id'          => uniqid('item'),
            'title'       => $title,
            'type'        => trim($_POST['type'] ?? ''),
            'date'        => trim($_POST['date'] ?? ''),
            'role'        => trim($_POST['role'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'skills'      => $skills,
            'reflection'  => [
                'whatIDid'     => trim($_POST['whatIDid'] ?? ''),
                'whatILearned' => trim($_POST['whatILearned'] ?? ''),
                'challenge'    => trim($_POST['challenge'] ?? ''),
                'nextStep'     => trim($_POST['nextStep'] ?? ''),
            ],
            'evidence'    => $evidence,
        ];

        $portfolios[$foundIndex]['items'][] = $newItem;
        writePortfolios($portfolios);

        sendJson([
            'status'     => 'success',
            'portfolios' => $portfolios
        ]);
    }

    sendJson(['error' => 'Invalid action'], 400);
}

sendJson(['error' => 'Method not allowed'], 405);