package com.kantechsolution.smart_school.service;

import java.util.LinkedHashMap;
import java.util.Map;

final class UiPhraseCatalog {

    private UiPhraseCatalog() {
    }

    static Map<String, Map<String, String>> phrases() {
        return CATALOG;
    }

    private static Map<String, String> t(String hi, String ar, String sw, String fr, String tr, String ru, String de, String nl) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("hi", hi);
        row.put("ar", ar);
        row.put("sw", sw);
        row.put("fr", fr);
        row.put("tr", tr);
        row.put("ru", ru);
        row.put("de", de);
        row.put("nl", nl);
        return row;
    }

    private static void p(Map<String, Map<String, String>> catalog, String english, Map<String, String> translations) {
        catalog.put(english, translations);
    }

    private static final Map<String, Map<String, String>> CATALOG = buildCatalog();

    private static Map<String, Map<String, String>> buildCatalog() {
        Map<String, Map<String, String>> catalog = new LinkedHashMap<>();

        p(catalog, "Current Session:", t(
                "वर्तमान सत्र:", "الجلسة الحالية:", "Kipindi cha Sasa:", "Session en cours :",
                "Mevcut Oturum:", "Текущая сессия:", "Aktuelle Sitzung:", "Huidige sessie:"));
        p(catalog, "Quick Links", t(
                "त्वरित लिंक", "روابط سريعة", "Viungo vya Haraka", "Liens rapides",
                "Hızlı Bağlantılar", "Быстрые ссылки", "Schnelllinks", "Snelle links"));
        p(catalog, "Dashboard", t(
                "डैशबोर्ड", "لوحة القيادة", "Dashibodi", "Tableau de bord",
                "Gösterge Paneli", "Панель управления", "Dashboard", "Dashboard"));
        p(catalog, "Front Office", t(
                "फ्रंट ऑफिस", "المكتب الأمامي", "Ofisi ya Mbele", "Accueil",
                "Ön Büro", "Ресепшн", "Front Office", "Frontoffice"));
        p(catalog, "Student Information", t(
                "छात्र जानकारी", "معلومات الطالب", "Taarifa za Mwanafunzi", "Informations élève",
                "Öğrenci Bilgileri", "Информация о студенте", "Schülerinformationen", "Studentinformatie"));
        p(catalog, "Fees Collection", t(
                "शुल्क संग्रह", "تحصيل الرسوم", "Ukusanyaji wa Ada", "Collecte des frais",
                "Ücret Tahsilatı", "Сбор платежей", "Gebühreneinzug", "Invorderen van kosten"));
        p(catalog, "Online Course", t(
                "ऑनलाइन कोर्स", "دورة عبر الإنترنت", "Kozi ya Mtandaoni", "Cours en ligne",
                "Çevrimiçi Kurs", "Онлайн-курс", "Online-Kurs", "Online cursus"));
        p(catalog, "Behaviour Records", t(
                "व्यवहार रिकॉर्ड", "سجلات السلوك", "Rekodi za Tabia", "Dossiers de comportement",
                "Davranış Kayıtları", "Записи поведения", "Verhaltensaufzeichnungen", "Gedragsregistraties"));
        p(catalog, "Multi Branch", t(
                "मल्टी ब्रांच", "فروع متعددة", "Matawi Mengi", "Multi-succursales",
                "Çoklu Şube", "Несколько филиалов", "Mehrere Filialen", "Meerdere vestigingen"));
        p(catalog, "Gmeet Live Classes", t(
                "Gmeet लाइव कक्षाएं", "حصص Gmeet المباشرة", "Madarasa ya Moja kwa Moja ya Gmeet", "Cours en direct Gmeet",
                "Gmeet Canlı Dersler", "Живые занятия Gmeet", "Gmeet Live-Klassen", "Gmeet live lessen"));
        p(catalog, "Zoom Live Classes", t(
                "Zoom लाइव कक्षाएं", "حصص Zoom المباشرة", "Madarasa ya Moja kwa Moja ya Zoom", "Cours en direct Zoom",
                "Zoom Canlı Dersler", "Живые занятия Zoom", "Zoom Live-Klassen", "Zoom live lessen"));
        p(catalog, "Income", t(
                "आय", "الدخل", "Mapato", "Revenus",
                "Gelir", "Доход", "Einnahmen", "Inkomsten"));
        p(catalog, "Expenses", t(
                "खर्च", "المصروفات", "Matumizi", "Dépenses",
                "Giderler", "Расходы", "Ausgaben", "Uitgaven"));
        p(catalog, "QR Code Attendance", t(
                "QR कोड उपस्थिति", "حضور رمز QR", "Mahudhurio ya QR Code", "Présence QR Code",
                "QR Kod Yoklama", "Посещаемость по QR-коду", "QR-Code-Anwesenheit", "QR-code aanwezigheid"));
        p(catalog, "CBSE Examination", t(
                "CBSE परीक्षा", "امتحان CBSE", "Mtihani wa CBSE", "Examen CBSE",
                "CBSE Sınavı", "Экзамен CBSE", "CBSE-Prüfung", "CBSE-examen"));
        p(catalog, "Examination", t(
                "परीक्षा", "الامتحان", "Mtihani", "Examen",
                "Sınav", "Экзамен", "Prüfung", "Examen"));
        p(catalog, "Attendance", t(
                "उपस्थिति", "الحضور", "Mahudhurio", "Présence",
                "Yoklama", "Посещаемость", "Anwesenheit", "Aanwezigheid"));
        p(catalog, "Online Examination", t(
                "ऑनलाइन परीक्षा", "امتحان عبر الإنترنت", "Mtihani wa Mtandaoni", "Examen en ligne",
                "Çevrimiçi Sınav", "Онлайн-экзамен", "Online-Prüfung", "Online examen"));
        p(catalog, "Academics", t(
                "शैक्षणिक", "الأكاديميات", "Masomo", "Académique",
                "Akademik", "Академическая часть", "Akademisch", "Academisch"));
        p(catalog, "Annual Calendar", t(
                "वार्षिक कैलेंडर", "التقويم السنوي", "Kalenda ya Mwaka", "Calendrier annuel",
                "Yıllık Takvim", "Годовой календарь", "Jahreskalender", "Jaarkalender"));
        p(catalog, "Lesson Plan", t(
                "पाठ योजना", "خطة الدرس", "Mpango wa Somo", "Plan de cours",
                "Ders Planı", "План урока", "Unterrichtsplan", "Lesplan"));
        p(catalog, "Human Resource", t(
                "मानव संसाधन", "الموارد البشرية", "Rasilimali Watu", "Ressources humaines",
                "İnsan Kaynakları", "Кадры", "Personalwesen", "Human resources"));
        p(catalog, "Communicate", t(
                "संचार", "التواصل", "Mawasiliano", "Communication",
                "İletişim", "Связь", "Kommunikation", "Communicatie"));
        p(catalog, "Download Center", t(
                "डाउनलोड केंद्र", "مركز التحميل", "Kituo cha Upakuaji", "Centre de téléchargement",
                "İndirme Merkezi", "Центр загрузок", "Download-Center", "Downloadcentrum"));
        p(catalog, "Homework", t(
                "गृहकार्य", "الواجب المنزلي", "Kazi ya Nyumbani", "Devoirs",
                "Ödev", "Домашнее задание", "Hausaufgaben", "Huiswerk"));
        p(catalog, "Library", t(
                "पुस्तकालय", "المكتبة", "Maktaba", "Bibliothèque",
                "Kütüphane", "Библиотека", "Bibliothek", "Bibliotheek"));
        p(catalog, "Inventory", t(
                "इन्वेंटरी", "المخزون", "Hesabu", "Inventaire",
                "Envanter", "Инвентарь", "Inventar", "Inventaris"));
        p(catalog, "Student CV", t(
                "छात्र सीवी", "السيرة الذاتية للطالب", "CV ya Mwanafunzi", "CV étudiant",
                "Öğrenci CV", "Резюме студента", "Schüler-Lebenslauf", "Student CV"));
        p(catalog, "Transport", t(
                "परिवहन", "النقل", "Usafiri", "Transport",
                "Ulaşım", "Транспорт", "Transport", "Vervoer"));
        p(catalog, "Hostel", t(
                "छात्रावास", "السكن", "Hosteli", "Internat",
                "Yurt", "Общежитие", "Wohnheim", "Hostel"));
        p(catalog, "Certificate", t(
                "प्रमाणपत्र", "الشهادة", "Cheti", "Certificat",
                "Sertifika", "Сертификат", "Zertifikat", "Certificaat"));
        p(catalog, "Front CMS", t(
                "फ्रंट CMS", "نظام إدارة المحتوى الأمامي", "CMS ya Mbele", "CMS frontal",
                "Ön CMS", "Фронт CMS", "Front-CMS", "Front CMS"));
        p(catalog, "Alumni", t(
                "पूर्व छात्र", "الخريجون", "Wahitimu", "Anciens élèves",
                "Mezunlar", "Выпускники", "Alumni", "Alumni"));
        p(catalog, "Reports", t(
                "रिपोर्ट", "التقارير", "Ripoti", "Rapports",
                "Raporlar", "Отчёты", "Berichte", "Rapporten"));
        p(catalog, "System Setting", t(
                "सिस्टम सेटिंग", "إعدادات النظام", "Mipangilio ya Mfumo", "Paramètres système",
                "Sistem Ayarları", "Настройки системы", "Systemeinstellungen", "Systeeminstellingen"));
        p(catalog, "Setting", t(
                "सेटिंग", "الإعدادات", "Mipangilio", "Paramètres",
                "Ayarlar", "Настройки", "Einstellungen", "Instellingen"));
        p(catalog, "Overview", t(
                "अवलोकन", "نظرة عامة", "Muhtasari", "Aperçu",
                "Genel Bakış", "Обзор", "Übersicht", "Overzicht"));
        p(catalog, "Report", t(
                "रिपोर्ट", "تقرير", "Ripoti", "Rapport",
                "Rapor", "Отчёт", "Bericht", "Rapport"));
        p(catalog, "Exam", t(
                "परीक्षा", "امتحان", "Mtihani", "Examen",
                "Sınav", "Экзамен", "Prüfung", "Examen"));
        p(catalog, "Exam Schedule", t(
                "परीक्षा कार्यक्रम", "جدول الامتحان", "Ratiba ya Mtihani", "Calendrier d'examen",
                "Sınav Programı", "Расписание экзаменов", "Prüfungsplan", "Examenschema"));
        p(catalog, "Admission Enquiry", t(
                "प्रवेश पूछताछ", "استفسار القبول", "Uchunguzi wa Uandikishaji", "Demande d'admission",
                "Kayıt Sorgusu", "Запрос о поступлении", "Aufnahmeanfrage", "Inschrijvingsaanvraag"));
        p(catalog, "Visitor Book", t(
                "आगंतुक पुस्तक", "سجل الزوار", "Kitabu cha Wageni", "Registre des visiteurs",
                "Ziyaretçi Defteri", "Журнал посетителей", "Besucherbuch", "Bezoekersboek"));
        p(catalog, "Student Details", t(
                "छात्र विवरण", "تفاصيل الطالب", "Maelezo ya Mwanafunzi", "Détails de l'élève",
                "Öğrenci Detayları", "Данные студента", "Schülerdetails", "Studentgegevens"));
        p(catalog, "Student Admission", t(
                "छात्र प्रवेश", "قبول الطالب", "Uandikishaji wa Mwanafunzi", "Admission élève",
                "Öğrenci Kaydı", "Зачисление студента", "Schüleraufnahme", "Studentinschrijving"));
        p(catalog, "Disabled Students", t(
                "अक्षम छात्र", "الطلاب المعطلون", "Wanafunzi Waliozimwa", "Élèves désactivés",
                "Devre Dışı Öğrenciler", "Отключённые студенты", "Deaktivierte Schüler", "Uitgeschakelde studenten"));
        p(catalog, "Collect Fees", t(
                "शुल्क एकत्र करें", "تحصيل الرسوم", "Kusanya Ada", "Collecter les frais",
                "Ücret Topla", "Собрать плату", "Gebühren einziehen", "Kosten innen"));
        p(catalog, "Staff Directory", t(
                "कर्मचारी निर्देशिका", "دليل الموظفين", "Orodha ya Wafanyakazi", "Annuaire du personnel",
                "Personel Rehberi", "Справочник сотрудников", "Personalverzeichnis", "Personeelsgids"));
        p(catalog, "Staff Attendance", t(
                "कर्मचारी उपस्थिति", "حضور الموظفين", "Mahudhurio ya Wafanyakazi", "Présence du personnel",
                "Personel Yoklaması", "Посещаемость сотрудников", "Personal-Anwesenheit", "Personeelsaanwezigheid"));
        p(catalog, "Payroll", t(
                "पेरोल", "كشف الرواتب", "Mishahara", "Paie",
                "Bordro", "Зарплата", "Gehaltsabrechnung", "Salarisadministratie"));
        p(catalog, "Student", t(
                "छात्र", "طالب", "Mwanafunzi", "Élève",
                "Öğrenci", "Студент", "Schüler", "Student"));
        p(catalog, "Admin", t(
                "व्यवस्थापक", "مسؤول", "Msimamizi", "Administrateur",
                "Yönetici", "Администратор", "Administrator", "Beheerder"));
        p(catalog, "Teacher", t(
                "शिक्षक", "معلم", "Mwalimu", "Enseignant",
                "Öğretmen", "Учитель", "Lehrer", "Leraar"));
        p(catalog, "Accountant", t(
                "लेखाकार", "محاسب", "Mhasibu", "Comptable",
                "Muhasebeci", "Бухгалтер", "Buchhalter", "Accountant"));
        p(catalog, "Librarian", t(
                "पुस्तकालयाध्यक्ष", "أمين المكتبة", "Maktaba", "Bibliothécaire",
                "Kütüphaneci", "Библиотекарь", "Bibliothekar", "Bibliothecaris"));
        p(catalog, "Receptionist", t(
                "रिसेप्शनिस्ट", "موظف الاستقبال", "Mpokeaji", "Réceptionniste",
                "Resepsiyonist", "Администратор", "Empfang", "Receptionist"));
        p(catalog, "Fees Overview", t(
                "शुल्क अवलोकन", "نظرة عامة على الرسوم", "Muhtasari wa Ada", "Aperçu des frais",
                "Ücret Genel Bakış", "Обзор платежей", "Gebührenübersicht", "Kostenoverzicht"));
        p(catalog, "Enquiry Overview", t(
                "पूछताछ अवलोकन", "نظرة عامة على الاستفسارات", "Muhtasari wa Uchunguzi", "Aperçu des demandes",
                "Sorgu Genel Bakış", "Обзор запросов", "Anfrageübersicht", "Aanvraagoverzicht"));
        p(catalog, "Library Overview", t(
                "पुस्तकालय अवलोकन", "نظرة عامة على المكتبة", "Muhtasari wa Maktaba", "Aperçu bibliothèque",
                "Kütüphane Genel Bakış", "Обзор библиотеки", "Bibliotheksübersicht", "Bibliotheekoverzicht"));
        p(catalog, "Student Today Attendance", t(
                "आज छात्र उपस्थिति", "حضور الطلاب اليوم", "Mahudhurio ya Wanafunzi Leo", "Présence élèves aujourd'hui",
                "Bugünkü Öğrenci Yoklaması", "Посещаемость студентов сегодня", "Heutige Schüleranwesenheit", "Studentaanwezigheid vandaag"));
        p(catalog, "Student Present Today", t(
                "आज उपस्थित छात्र", "الطلاب الحاضرون اليوم", "Wanafunzi Waliohudhuria Leo", "Élèves présents aujourd'hui",
                "Bugün Mevcut Öğrenciler", "Студенты на месте сегодня", "Heute anwesende Schüler", "Studenten aanwezig vandaag"));
        p(catalog, "Staff Present Today", t(
                "आज उपस्थित कर्मचारी", "الموظفون الحاضرون اليوم", "Wafanyakazi Waliohudhuria Leo", "Personnel présent aujourd'hui",
                "Bugün Mevcut Personel", "Сотрудники на месте сегодня", "Heute anwesendes Personal", "Personeel aanwezig vandaag"));
        p(catalog, "Monthly Fees Collection", t(
                "मासिक शुल्क संग्रह", "تحصيل الرسوم الشهرية", "Ukusanyaji wa Ada wa Kila Mwezi", "Collecte mensuelle des frais",
                "Aylık Ücret Tahsilatı", "Ежемесячный сбор платежей", "Monatlicher Gebühreneinzug", "Maandelijkse kosteninning"));
        p(catalog, "Monthly Expenses", t(
                "मासिक खर्च", "المصروفات الشهرية", "Matumizi ya Kila Mwezi", "Dépenses mensuelles",
                "Aylık Giderler", "Ежемесячные расходы", "Monatliche Ausgaben", "Maandelijkse uitgaven"));
        p(catalog, "Student Head Count", t(
                "छात्र संख्या", "عدد الطلاب", "Idadi ya Wanafunzi", "Effectif élèves",
                "Öğrenci Sayısı", "Число студентов", "Schülerzahl", "Aantal studenten"));
        p(catalog, "Fees Awaiting Payment", t(
                "भुगतान की प्रतीक्षा में शुल्क", "رسوم في انتظار الدفع", "Ada Zinazosubiri Malipo", "Frais en attente de paiement",
                "Ödeme Bekleyen Ücretler", "Ожидающие оплаты платежи", "Ausstehende Gebühren", "Te betalen kosten"));
        p(catalog, "Profile", t(
                "प्रोफ़ाइल", "الملف الشخصي", "Wasifu", "Profil",
                "Profil", "Профиль", "Profil", "Profiel"));
        p(catalog, "Logout", t(
                "लॉग आउट", "تسجيل الخروج", "Toka", "Déconnexion",
                "Çıkış", "Выход", "Abmelden", "Uitloggen"));
        p(catalog, "Language", t(
                "भाषा", "اللغة", "Lugha", "Langue",
                "Dil", "Язык", "Sprache", "Taal"));
        p(catalog, "Search", t(
                "खोजें", "بحث", "Tafuta", "Rechercher",
                "Ara", "Поиск", "Suchen", "Zoeken"));
        p(catalog, "Save", t(
                "सहेजें", "حفظ", "Hifadhi", "Enregistrer",
                "Kaydet", "Сохранить", "Speichern", "Opslaan"));
        p(catalog, "Cancel", t(
                "रद्द करें", "إلغاء", "Ghairi", "Annuler",
                "İptal", "Отмена", "Abbrechen", "Annuleren"));
        p(catalog, "Delete", t(
                "हटाएं", "حذف", "Futa", "Supprimer",
                "Sil", "Удалить", "Löschen", "Verwijderen"));
        p(catalog, "Edit", t(
                "संपादित करें", "تعديل", "Hariri", "Modifier",
                "Düzenle", "Редактировать", "Bearbeiten", "Bewerken"));
        p(catalog, "Add", t(
                "जोड़ें", "إضافة", "Ongeza", "Ajouter",
                "Ekle", "Добавить", "Hinzufügen", "Toevoegen"));
        p(catalog, "Disabled Staff", t(
                "अक्षम कर्मचारी", "الموظفون المعطلون", "Wafanyakazi Waliozimwa", "Personnel désactivé",
                "Devre Dışı Personel", "Отключённые сотрудники", "Deaktiviertes Personal", "Uitgeschakeld personeel"));
        p(catalog, "Staff ID", t(
                "कर्मचारी आईडी", "معرف الموظف", "Kitambulisho cha Mfanyakazi", "ID personnel",
                "Personel Kimliği", "ID сотрудника", "Personal-ID", "Personeels-ID"));
        p(catalog, "Role", t(
                "भूमिका", "الدور", "Jukumu", "Rôle",
                "Rol", "Роль", "Rolle", "Rol"));
        p(catalog, "Department", t(
                "विभाग", "القسم", "Idara", "Département",
                "Departman", "Отдел", "Abteilung", "Afdeling"));
        p(catalog, "Designation", t(
                "पदनाम", "المسمى الوظيفي", "Cheo", "Désignation",
                "Unvan", "Должность", "Bezeichnung", "Functie"));
        p(catalog, "Date Of Joining", t(
                "शामिल होने की तिथि", "تاريخ الانضمام", "Tarehe ya Kujiunga", "Date d'adhésion",
                "Katılım Tarihi", "Дата приёма", "Eintrittsdatum", "Datum van indiensttreding"));
        p(catalog, "Disable Date", t(
                "अक्षम तिथि", "تاريخ التعطيل", "Tarehe ya Kuzimwa", "Date de désactivation",
                "Devre Dışı Tarihi", "Дата отключения", "Deaktivierungsdatum", "Uitschakeldatum"));
        p(catalog, "Action", t(
                "कार्रवाई", "إجراء", "Hatua", "Action",
                "İşlem", "Действие", "Aktion", "Actie"));
        p(catalog, "Name", t(
                "नाम", "الاسم", "Jina", "Nom",
                "Ad", "Имя", "Name", "Naam"));
        p(catalog, "Mobile Number", t(
                "मोबाइल नंबर", "رقم الجوال", "Nambari ya Simu", "Numéro mobile",
                "Cep Telefonu", "Мобильный номер", "Handynummer", "Mobiel nummer"));
        p(catalog, "My Profile", t(
                "मेरी प्रोफ़ाइल", "ملفي الشخصي", "Wasifu Wangu", "Mon profil",
                "Profilim", "Мой профиль", "Mein Profil", "Mijn profiel"));
        p(catalog, "Password", t(
                "पासवर्ड", "كلمة المرور", "Nenosiri", "Mot de passe",
                "Şifre", "Пароль", "Passwort", "Wachtwoord"));
        p(catalog, "Front Site", t(
                "फ्रंट साइट", "الموقع الأمامي", "Tovuti ya Mbele", "Site frontal",
                "Ön Site", "Фронт-сайт", "Frontseite", "Frontsite"));

        return catalog;
    }
}
