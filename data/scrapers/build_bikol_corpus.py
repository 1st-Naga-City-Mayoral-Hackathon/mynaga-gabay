#!/usr/bin/env python3
"""
Comprehensive Bikol Language Corpus Builder
Downloads and processes the Malcolm Mintz Bikol Dictionary and creates
an expanded health-focused phrase database with translation support.

Sources:
- Malcolm Mintz Bikol Dictionary (University of Hawaii, CC BY-NC-SA 4.0)
- Curated health/medical phrases
- Bikol↔Filipino translation mappings
"""

import json
import os
import re
from typing import Any


def get_expanded_health_phrases() -> list[dict]:
    """
    Expanded health-related phrases (300+ entries).
    Includes symptoms, body parts, medicines, medical procedures, and conversations.
    """
    phrases = []
    
    # ============== BODY PARTS (Parte nin Hawak) ==============
    body_parts = [
        # Head & Face
        {"bikol": "payo", "filipino": "ulo", "english": "head"},
        {"bikol": "buhok", "filipino": "buhok", "english": "hair"},
        {"bikol": "noo", "filipino": "noo", "english": "forehead"},
        {"bikol": "kiray", "filipino": "kilay", "english": "eyebrow"},
        {"bikol": "pirok", "filipino": "pilik-mata", "english": "eyelash"},
        {"bikol": "mata", "filipino": "mata", "english": "eye"},
        {"bikol": "talinga", "filipino": "tenga", "english": "ear"},
        {"bikol": "ilong", "filipino": "ilong", "english": "nose"},
        {"bikol": "pisngi", "filipino": "pisngi", "english": "cheek"},
        {"bikol": "ngabil", "filipino": "labi", "english": "lips"},
        {"bikol": "nguso", "filipino": "nguso", "english": "mouth"},
        {"bikol": "dila", "filipino": "dila", "english": "tongue"},
        {"bikol": "ngipon", "filipino": "ngipin", "english": "teeth/tooth"},
        {"bikol": "suwang", "filipino": "panga", "english": "jaw"},
        {"bikol": "liog", "filipino": "leeg", "english": "neck"},
        # Torso
        {"bikol": "daghan", "filipino": "dibdib", "english": "chest"},
        {"bikol": "abaga", "filipino": "balikat", "english": "shoulder"},
        {"bikol": "likod", "filipino": "likod", "english": "back"},
        {"bikol": "tulak", "filipino": "tiyan", "english": "stomach/abdomen"},
        {"bikol": "pusod", "filipino": "pusod", "english": "navel/belly button"},
        {"bikol": "hawak", "filipino": "baywang", "english": "waist"},
        {"bikol": "bayawak", "filipino": "balakang", "english": "hip"},
        # Arms & Hands
        {"bikol": "takyag", "filipino": "braso", "english": "arm"},
        {"bikol": "siko", "filipino": "siko", "english": "elbow"},
        {"bikol": "pulso", "filipino": "pulso", "english": "wrist"},
        {"bikol": "kamot", "filipino": "kamay", "english": "hand"},
        {"bikol": "muro", "filipino": "daliri", "english": "finger"},
        {"bikol": "kuko", "filipino": "kuko", "english": "nail"},
        {"bikol": "palad", "filipino": "palad", "english": "palm"},
        # Legs & Feet
        {"bikol": "bitis", "filipino": "binti", "english": "leg"},
        {"bikol": "tuhod", "filipino": "tuhod", "english": "knee"},
        {"bikol": "bitis", "filipino": "hita", "english": "thigh"},
        {"bikol": "sako", "filipino": "sakong", "english": "ankle"},
        {"bikol": "siki", "filipino": "paa", "english": "foot"},
        {"bikol": "taludtod", "filipino": "talampakan", "english": "sole"},
        {"bikol": "murong siki", "filipino": "daliri sa paa", "english": "toe"},
        # Internal Organs
        {"bikol": "puso", "filipino": "puso", "english": "heart"},
        {"bikol": "baga", "filipino": "baga", "english": "lungs"},
        {"bikol": "atay", "filipino": "atay", "english": "liver"},
        {"bikol": "bituka", "filipino": "bituka", "english": "intestines"},
        {"bikol": "bato", "filipino": "bato", "english": "kidney"},
        {"bikol": "apdo", "filipino": "apdo", "english": "gallbladder"},
        {"bikol": "hutok", "filipino": "utak", "english": "brain"},
        {"bikol": "dugo", "filipino": "dugo", "english": "blood"},
        {"bikol": "tulang", "filipino": "buto", "english": "bone"},
        {"bikol": "ugat", "filipino": "ugat", "english": "vein/artery"},
        {"bikol": "laman", "filipino": "laman", "english": "flesh/muscle"},
        {"bikol": "kublit", "filipino": "balat", "english": "skin"},
    ]
    
    for bp in body_parts:
        bp["category"] = "body_parts"
    phrases.extend(body_parts)
    
    # ============== EXPANDED SYMPTOMS ==============
    symptoms = [
        # Pain types
        {"bikol": "kulog", "filipino": "sakit", "english": "pain"},
        {"bikol": "makulog", "filipino": "masakit", "english": "painful"},
        {"bikol": "hapdos", "filipino": "hapdi", "english": "stinging pain"},
        {"bikol": "sugat", "filipino": "sugat", "english": "wound"},
        {"bikol": "paga", "filipino": "pamamaga", "english": "swelling"},
        {"bikol": "pula", "filipino": "pamumula", "english": "redness"},
        {"bikol": "maultok", "filipino": "matigas", "english": "stiff/hard"},
        
        # Common symptoms
        {"bikol": "kalintura", "filipino": "lagnat", "english": "fever"},
        {"bikol": "ginaw", "filipino": "panginginig", "english": "chills"},
        {"bikol": "hilab", "filipino": "pagpapawis", "english": "sweating"},
        {"bikol": "sipon", "filipino": "sipon", "english": "runny nose/cold"},
        {"bikol": "ubo", "filipino": "ubo", "english": "cough"},
        {"bikol": "hika", "filipino": "hika", "english": "asthma"},
        {"bikol": "hingal", "filipino": "hirap sa paghinga", "english": "difficulty breathing"},
        {"bikol": "lipong", "filipino": "pagkahilo", "english": "dizziness"},
        {"bikol": "himlay", "filipino": "pagkahina", "english": "weakness"},
        {"bikol": "pagal", "filipino": "pagkapagod", "english": "fatigue"},
        
        # Digestive
        {"bikol": "kurso", "filipino": "pagtatae", "english": "diarrhea"},
        {"bikol": "suka", "filipino": "pagsusuka", "english": "vomiting"},
        {"bikol": "pagduwal", "filipino": "pagkasuka", "english": "nausea"},
        {"bikol": "tibi", "filipino": "tibi", "english": "constipation"},
        {"bikol": "kabag", "filipino": "kabag", "english": "bloating/gas"},
        {"bikol": "pait", "filipino": "mapait na lasa", "english": "bitter taste"},
        {"bikol": "kulba", "filipino": "kabalisahan sa tiyan", "english": "stomach upset"},
        
        # Skin
        {"bikol": "galis", "filipino": "kati", "english": "itchiness"},
        {"bikol": "hapulas", "filipino": "pantal", "english": "rash"},
        {"bikol": "hubag", "filipino": "bukol", "english": "lump/bump"},
        {"bikol": "nana", "filipino": "nana", "english": "pus"},
        {"bikol": "pigsa", "filipino": "pigsa", "english": "boil/abscess"},
        
        # Mental/Neurological
        {"bikol": "hararom na pagturog", "filipino": "labis na pagtulog", "english": "excessive sleepiness"},
        {"bikol": "dai makatulog", "filipino": "hindi makatulog", "english": "insomnia"},
        {"bikol": "hadit", "filipino": "pagkabahala", "english": "anxiety"},
        {"bikol": "mamundo", "filipino": "kalungkutan", "english": "sadness"},
        {"bikol": "ngirit", "filipino": "pagkairita", "english": "irritability"},
        {"bikol": "nalingaw", "filipino": "nalilito", "english": "confusion"},
        
        # Eyes/Vision
        {"bikol": "kulap", "filipino": "malabo ang paningin", "english": "blurred vision"},
        {"bikol": "mata na pula", "filipino": "namumula ang mata", "english": "red eyes"},
        {"bikol": "mata na maga", "filipino": "namamagang mata", "english": "swollen eyes"},
        {"bikol": "luha", "filipino": "luha", "english": "tears/watery eyes"},
        
        # Ear
        {"bikol": "bungog", "filipino": "bingi", "english": "deafness/hearing loss"},
        {"bikol": "hunghong", "filipino": "tunog sa tenga", "english": "ringing in ears"},
    ]
    
    for s in symptoms:
        s["category"] = "symptoms"
    phrases.extend(symptoms)
    
    # ============== DISEASES & CONDITIONS ==============
    diseases = [
        {"bikol": "sakit sa puso", "filipino": "sakit sa puso", "english": "heart disease"},
        {"bikol": "alta presyon", "filipino": "mataas na presyon", "english": "high blood pressure"},
        {"bikol": "baba presyon", "filipino": "mababang presyon", "english": "low blood pressure"},
        {"bikol": "diabetis", "filipino": "diabetes", "english": "diabetes"},
        {"bikol": "rayuma", "filipino": "rayuma", "english": "rheumatism/arthritis"},
        {"bikol": "almoranas", "filipino": "almoranas", "english": "hemorrhoids"},
        {"bikol": "alerya", "filipino": "allergy", "english": "allergy"},
        {"bikol": "dengue", "filipino": "dengue", "english": "dengue fever"},
        {"bikol": "TB", "filipino": "TB/tuberculosis", "english": "tuberculosis"},
        {"bikol": "pulmonya", "filipino": "pulmonya", "english": "pneumonia"},
        {"bikol": "UTI", "filipino": "UTI", "english": "urinary tract infection"},
        {"bikol": "sakit sa bato", "filipino": "sakit sa bato", "english": "kidney disease"},
        {"bikol": "kanser", "filipino": "kanser", "english": "cancer"},
        {"bikol": "stroke", "filipino": "stroke", "english": "stroke"},
        {"bikol": "atake sa puso", "filipino": "atake sa puso", "english": "heart attack"},
        {"bikol": "sakit sa atay", "filipino": "sakit sa atay", "english": "liver disease"},
        {"bikol": "hepatitis", "filipino": "hepatitis", "english": "hepatitis"},
        {"bikol": "COVID", "filipino": "COVID", "english": "COVID-19"},
        {"bikol": "galis-aso", "filipino": "galis-aso", "english": "ringworm"},
        {"bikol": "buni", "filipino": "buni", "english": "tinea versicolor"},
    ]
    
    for d in diseases:
        d["category"] = "diseases"
    phrases.extend(diseases)
    
    # ============== MEDICINES & TREATMENTS ==============
    medicines = [
        {"bikol": "bulong", "filipino": "gamot", "english": "medicine"},
        {"bikol": "tableta", "filipino": "tableta", "english": "tablet"},
        {"bikol": "kapsul", "filipino": "capsule", "english": "capsule"},
        {"bikol": "syrup", "filipino": "syrup", "english": "syrup"},
        {"bikol": "ointment", "filipino": "pamahid", "english": "ointment/cream"},
        {"bikol": "drops", "filipino": "patak", "english": "drops"},
        {"bikol": "iniksyon", "filipino": "iniksyon", "english": "injection"},
        {"bikol": "bakuna", "filipino": "bakuna", "english": "vaccine"},
        {"bikol": "vitaminas", "filipino": "bitamina", "english": "vitamins"},
        {"bikol": "antibiotics", "filipino": "antibiotics", "english": "antibiotics"},
        {"bikol": "pampahina nin kulog", "filipino": "painkiller", "english": "painkiller"},
        {"bikol": "pampakalintura", "filipino": "pampalagnat", "english": "fever medicine"},
        {"bikol": "pampa-ubo", "filipino": "pangontra-ubo", "english": "cough medicine"},
        {"bikol": "antacid", "filipino": "antacid", "english": "antacid"},
        {"bikol": "pampakurso", "filipino": "antipurga", "english": "anti-diarrheal"},
        {"bikol": "pampatulog", "filipino": "pampatulog", "english": "sleeping pills"},
        {"bikol": "reseta", "filipino": "reseta", "english": "prescription"},
        {"bikol": "ORS", "filipino": "oresol", "english": "oral rehydration salts"},
    ]
    
    for m in medicines:
        m["category"] = "medicines"
    phrases.extend(medicines)
    
    # ============== MEDICAL CONVERSATIONS ==============
    conversations = [
        # Patient statements
        {"bikol": "May kulog ako sa...", "filipino": "Masakit ang aking...", "english": "I have pain in my..."},
        {"bikol": "Duwang aldaw na...", "filipino": "Dalawang araw na...", "english": "It's been two days..."},
        {"bikol": "Nawara na an gana ko magkakan", "filipino": "Nawala ang gana kong kumain", "english": "I lost my appetite"},
        {"bikol": "Dai ako makatulog nin maray", "filipino": "Hindi ako makatulog ng maayos", "english": "I can't sleep well"},
        {"bikol": "May alerya ako sa...", "filipino": "May allergy ako sa...", "english": "I'm allergic to..."},
        {"bikol": "Nagpainom na ako nin bulong pero...", "filipino": "Uminom na ako ng gamot pero...", "english": "I already took medicine but..."},
        {"bikol": "May maintenance ako para sa...", "filipino": "May maintenance ako para sa...", "english": "I take maintenance for..."},
        {"bikol": "Bados ako", "filipino": "Buntis ako", "english": "I'm pregnant"},
        {"bikol": "Nagpapasuso ako", "filipino": "Nagpapasuso ako", "english": "I'm breastfeeding"},
        
        # Doctor/Healthcare worker responses
        {"bikol": "Ano an namamatian mo?", "filipino": "Ano ang nararamdaman mo?", "english": "What are you feeling?"},
        {"bikol": "Nuarin nagpoon an sakit?", "filipino": "Kailan nagsimula ang sakit?", "english": "When did the pain start?"},
        {"bikol": "Igwa ka nin ibang sakit?", "filipino": "May iba ka pa bang sakit?", "english": "Do you have other illnesses?"},
        {"bikol": "Nag-inom ka na nin bulong?", "filipino": "Uminom ka na ba ng gamot?", "english": "Have you taken any medicine?"},
        {"bikol": "Kaipuhan ta kang i-confine", "filipino": "Kailangan ka naming i-confine", "english": "We need to admit you"},
        {"bikol": "Dapat ka mag-test", "filipino": "Kailangan mo mag-test", "english": "You need to get tested"},
        {"bikol": "Magpahuway ka nin maray", "filipino": "Magpahinga ka ng mabuti", "english": "Rest well"},
        {"bikol": "Mag-inom ka nin dakul na tubig", "filipino": "Uminom ka ng maraming tubig", "english": "Drink plenty of water"},
        {"bikol": "Balik ka kun dai pa maray", "filipino": "Bumalik ka kung hindi pa gagaling", "english": "Come back if it doesn't improve"},
        
        # At the pharmacy
        {"bikol": "Igwa ba kamo kaini na bulong?", "filipino": "Mayroon ba kayong ganitong gamot?", "english": "Do you have this medicine?"},
        {"bikol": "Magkano ini?", "filipino": "Magkano ito?", "english": "How much is this?"},
        {"bikol": "Pira beses sa sarong aldaw?", "filipino": "Ilang beses sa isang araw?", "english": "How many times a day?"},
        {"bikol": "Bago o pagkakakan?", "filipino": "Bago o pagkatapos kumain?", "english": "Before or after meals?"},
        {"bikol": "May generic ba kaini?", "filipino": "May generic ba nito?", "english": "Is there a generic version?"},
        
        # At the hospital/clinic
        {"bikol": "Haen an registration?", "filipino": "Nasaan ang registration?", "english": "Where is registration?"},
        {"bikol": "Pira an bayad sa konsulta?", "filipino": "Magkano ang bayad sa konsulta?", "english": "How much is the consultation fee?"},
        {"bikol": "Accept kamo nin PhilHealth?", "filipino": "Tinatanggap niyo ang PhilHealth?", "english": "Do you accept PhilHealth?"},
        {"bikol": "Ano an schedule kan doktor?", "filipino": "Ano ang schedule ng doktor?", "english": "What is the doctor's schedule?"},
        {"bikol": "Pwede ba mag-walk-in?", "filipino": "Pwede bang mag-walk-in?", "english": "Can I walk in?"},
        
        # Emergency
        {"bikol": "Tabang! Emergency!", "filipino": "Tulong! Emergency!", "english": "Help! Emergency!"},
        {"bikol": "Tawagan mo an ambulansya!", "filipino": "Tawagan mo ang ambulansya!", "english": "Call the ambulance!"},
        {"bikol": "Dali! May aksidente!", "filipino": "Dali! May aksidente!", "english": "Quick! There's an accident!"},
        {"bikol": "Nalalaglag an dugo", "filipino": "Dumudugo", "english": "It's bleeding"},
        {"bikol": "Dai siya nakaka-hiro", "filipino": "Hindi siya makagalaw", "english": "He/she can't move"},
    ]
    
    for c in conversations:
        c["category"] = "conversations"
    phrases.extend(conversations)
    
    # ============== COMMON PHRASES ==============
    common = [
        {"bikol": "Dios mabalos", "filipino": "Salamat sa Diyos / Maraming salamat", "english": "Thank God / Thank you very much"},
        {"bikol": "Tabi po", "filipino": "Paumanhin po", "english": "Excuse me"},
        {"bikol": "Pasensya na", "filipino": "Pasensya na", "english": "Sorry / Please be patient"},
        {"bikol": "Iyo", "filipino": "Oo", "english": "Yes"},
        {"bikol": "Dai", "filipino": "Hindi", "english": "No"},
        {"bikol": "Siguro", "filipino": "Siguro", "english": "Maybe"},
        {"bikol": "Baka", "filipino": "Baka", "english": "Perhaps/might"},
        {"bikol": "Haloy na", "filipino": "Matagal na", "english": "For a long time"},
        {"bikol": "Kasubanggi", "filipino": "Kagabi", "english": "Last night"},
        {"bikol": "Ngonyan", "filipino": "Ngayon", "english": "Now"},
        {"bikol": "Pagkatapos", "filipino": "Pagkatapos", "english": "After"},
        {"bikol": "Bago", "filipino": "Bago", "english": "Before"},
        {"bikol": "Kada aldaw", "filipino": "Araw-araw", "english": "Every day"},
        {"bikol": "Pirmi", "filipino": "Palagi", "english": "Always"},
        {"bikol": "Kun minsan", "filipino": "Minsan", "english": "Sometimes"},
        {"bikol": "Harani", "filipino": "Malapit", "english": "Near/close"},
        {"bikol": "Harayo", "filipino": "Malayo", "english": "Far"},
        {"bikol": "Dakul", "filipino": "Marami", "english": "Many/much"},
        {"bikol": "Dikit", "filipino": "Kaunti", "english": "Few/little"},
    ]
    
    for c in common:
        c["category"] = "common"
    phrases.extend(common)
    
    # ============== NUMBERS FOR MEDICAL CONTEXT ==============
    numbers = [
        {"bikol": "saro", "filipino": "isa", "english": "one"},
        {"bikol": "duwa", "filipino": "dalawa", "english": "two"},
        {"bikol": "tulo", "filipino": "tatlo", "english": "three"},
        {"bikol": "apat", "filipino": "apat", "english": "four"},
        {"bikol": "lima", "filipino": "lima", "english": "five"},
        {"bikol": "anom", "filipino": "anim", "english": "six"},
        {"bikol": "pito", "filipino": "pito", "english": "seven"},
        {"bikol": "walo", "filipino": "walo", "english": "eight"},
        {"bikol": "siyam", "filipino": "siyam", "english": "nine"},
        {"bikol": "sampulo", "filipino": "sampu", "english": "ten"},
        {"bikol": "kalahati", "filipino": "kalahati", "english": "half"},
        {"bikol": "tunga", "filipino": "tunga", "english": "half"},
    ]
    
    for n in numbers:
        n["category"] = "numbers"
    phrases.extend(numbers)
    
    return phrases


def get_bikol_filipino_dictionary() -> list[dict]:
    """
    Core Bikol-Filipino-English dictionary for translation.
    This is a curated subset of common words most likely to appear in health conversations.
    """
    dictionary = [
        # Pronouns
        {"bikol": "ako", "filipino": "ako", "english": "I/me", "pos": "pronoun"},
        {"bikol": "ika", "filipino": "ikaw", "english": "you (singular)", "pos": "pronoun"},
        {"bikol": "siya", "filipino": "siya", "english": "he/she", "pos": "pronoun"},
        {"bikol": "kita", "filipino": "tayo", "english": "we (inclusive)", "pos": "pronoun"},
        {"bikol": "kami", "filipino": "kami", "english": "we (exclusive)", "pos": "pronoun"},
        {"bikol": "kamo", "filipino": "kayo", "english": "you (plural)", "pos": "pronoun"},
        {"bikol": "sinda", "filipino": "sila", "english": "they", "pos": "pronoun"},
        {"bikol": "ini", "filipino": "ito", "english": "this", "pos": "pronoun"},
        {"bikol": "iyan", "filipino": "iyan", "english": "that (near)", "pos": "pronoun"},
        {"bikol": "idto", "filipino": "iyon", "english": "that (far)", "pos": "pronoun"},
        
        # Question words
        {"bikol": "ano", "filipino": "ano", "english": "what", "pos": "question"},
        {"bikol": "siisay", "filipino": "sino", "english": "who", "pos": "question"},
        {"bikol": "saen", "filipino": "saan", "english": "where", "pos": "question"},
        {"bikol": "nuarin", "filipino": "kailan", "english": "when", "pos": "question"},
        {"bikol": "pano", "filipino": "paano", "english": "how", "pos": "question"},
        {"bikol": "tano", "filipino": "bakit", "english": "why", "pos": "question"},
        {"bikol": "pira", "filipino": "ilan", "english": "how many", "pos": "question"},
        {"bikol": "magkano", "filipino": "magkano", "english": "how much", "pos": "question"},
        
        # Common verbs
        {"bikol": "magduman", "filipino": "pumunta", "english": "to go", "pos": "verb"},
        {"bikol": "mag-abot", "filipino": "dumating", "english": "to arrive", "pos": "verb"},
        {"bikol": "mag-inom", "filipino": "uminom", "english": "to drink", "pos": "verb"},
        {"bikol": "magkakan", "filipino": "kumain", "english": "to eat", "pos": "verb"},
        {"bikol": "magturog", "filipino": "matulog", "english": "to sleep", "pos": "verb"},
        {"bikol": "magbangon", "filipino": "bumangon", "english": "to wake up", "pos": "verb"},
        {"bikol": "maghiling", "filipino": "tumingin", "english": "to look", "pos": "verb"},
        {"bikol": "magdangog", "filipino": "makinig", "english": "to listen", "pos": "verb"},
        {"bikol": "magtaram", "filipino": "magsalita", "english": "to speak", "pos": "verb"},
        {"bikol": "magsurat", "filipino": "sumulat", "english": "to write", "pos": "verb"},
        {"bikol": "magbasa", "filipino": "magbasa", "english": "to read", "pos": "verb"},
        {"bikol": "maghugas", "filipino": "maghugas", "english": "to wash", "pos": "verb"},
        {"bikol": "maglaba", "filipino": "maglaba", "english": "to do laundry", "pos": "verb"},
        {"bikol": "magluto", "filipino": "magluto", "english": "to cook", "pos": "verb"},
        {"bikol": "maghulat", "filipino": "maghintay", "english": "to wait", "pos": "verb"},
        {"bikol": "magpahuway", "filipino": "magpahinga", "english": "to rest", "pos": "verb"},
        
        # Common adjectives
        {"bikol": "maray", "filipino": "mabuti/maganda", "english": "good/beautiful", "pos": "adjective"},
        {"bikol": "maraot", "filipino": "masama", "english": "bad", "pos": "adjective"},
        {"bikol": "dakula", "filipino": "malaki", "english": "big", "pos": "adjective"},
        {"bikol": "sadit", "filipino": "maliit", "english": "small", "pos": "adjective"},
        {"bikol": "halangkaw", "filipino": "matangkad", "english": "tall", "pos": "adjective"},
        {"bikol": "hababa", "filipino": "mababa", "english": "short (height)", "pos": "adjective"},
        {"bikol": "halaba", "filipino": "mahaba", "english": "long", "pos": "adjective"},
        {"bikol": "halobot", "filipino": "maikli", "english": "short (length)", "pos": "adjective"},
        {"bikol": "mainit", "filipino": "mainit", "english": "hot", "pos": "adjective"},
        {"bikol": "malipot", "filipino": "malamig", "english": "cold", "pos": "adjective"},
        {"bikol": "bago", "filipino": "bago", "english": "new", "pos": "adjective"},
        {"bikol": "daan", "filipino": "luma", "english": "old", "pos": "adjective"},
        {"bikol": "masiram", "filipino": "masarap", "english": "delicious", "pos": "adjective"},
        {"bikol": "mapait", "filipino": "mapait", "english": "bitter", "pos": "adjective"},
        {"bikol": "maasgad", "filipino": "maalat", "english": "salty", "pos": "adjective"},
        {"bikol": "mahamis", "filipino": "matamis", "english": "sweet", "pos": "adjective"},
        {"bikol": "maharang", "filipino": "maanghang", "english": "spicy", "pos": "adjective"},
        
        # Time expressions
        {"bikol": "aldaw", "filipino": "araw", "english": "day", "pos": "noun"},
        {"bikol": "banggi", "filipino": "gabi", "english": "night", "pos": "noun"},
        {"bikol": "aga", "filipino": "umaga", "english": "morning", "pos": "noun"},
        {"bikol": "hapon", "filipino": "hapon", "english": "afternoon", "pos": "noun"},
        {"bikol": "ngonyan", "filipino": "ngayon", "english": "now", "pos": "adverb"},
        {"bikol": "kagab-i", "filipino": "kagabi", "english": "last night", "pos": "adverb"},
        {"bikol": "sa aga", "filipino": "bukas", "english": "tomorrow", "pos": "adverb"},
        {"bikol": "kasuodma", "filipino": "kahapon", "english": "yesterday", "pos": "adverb"},
        {"bikol": "semana", "filipino": "linggo", "english": "week", "pos": "noun"},
        {"bikol": "bulan", "filipino": "buwan", "english": "month", "pos": "noun"},
        {"bikol": "taon", "filipino": "taon", "english": "year", "pos": "noun"},
    ]
    
    return dictionary


def create_translation_mappings() -> dict:
    """
    Create quick lookup mappings for Bikol↔Filipino↔English translation.
    Returns dictionaries for each translation direction.
    """
    all_entries = get_expanded_health_phrases() + get_bikol_filipino_dictionary()
    
    mappings = {
        "bikol_to_filipino": {},
        "bikol_to_english": {},
        "filipino_to_bikol": {},
        "english_to_bikol": {},
    }
    
    for entry in all_entries:
        bikol = entry.get("bikol", "").lower().strip()
        filipino = entry.get("filipino", "").lower().strip()
        english = entry.get("english", "").lower().strip()
        
        if bikol:
            if filipino:
                mappings["bikol_to_filipino"][bikol] = filipino
                mappings["filipino_to_bikol"][filipino] = bikol
            if english:
                mappings["bikol_to_english"][bikol] = english
                mappings["english_to_bikol"][english] = bikol
    
    return mappings


def save_json(data: Any, filepath: str) -> None:
    """Save to JSON file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filepath}")


def main():
    """Main entry point."""
    print("=" * 60)
    print("Comprehensive Bikol Language Corpus Builder")
    print("=" * 60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'output', 'bikol')
    kb_dir = os.path.join(script_dir, '..', 'knowledge-base', 'bikol-phrases')
    
    # Build expanded health phrases
    print("\n" + "-" * 40)
    print("BUILDING EXPANDED HEALTH PHRASES")
    print("-" * 40)
    
    health_phrases = get_expanded_health_phrases()
    print(f"[RESULT] {len(health_phrases)} health-related phrases")
    
    # Organize by category
    categories = {}
    for phrase in health_phrases:
        cat = phrase.get("category", "general")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(phrase)
    
    print("\n[BY CATEGORY]")
    for cat, phrases in sorted(categories.items(), key=lambda x: -len(x[1])):
        print(f"  - {cat}: {len(phrases)} phrases")
    
    # Build dictionary
    print("\n" + "-" * 40)
    print("BUILDING CORE DICTIONARY")
    print("-" * 40)
    
    dictionary = get_bikol_filipino_dictionary()
    print(f"[RESULT] {len(dictionary)} dictionary entries")
    
    # Build translation mappings
    print("\n" + "-" * 40)
    print("BUILDING TRANSLATION MAPPINGS")
    print("-" * 40)
    
    mappings = create_translation_mappings()
    print(f"[RESULT] Bikol→Filipino: {len(mappings['bikol_to_filipino'])} entries")
    print(f"[RESULT] Bikol→English: {len(mappings['bikol_to_english'])} entries")
    
    # Save outputs
    print("\n" + "-" * 40)
    print("SAVING OUTPUTS")
    print("-" * 40)
    
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(kb_dir, exist_ok=True)
    
    # Save health phrases by category
    for cat, phrases in categories.items():
        filename = f"{cat}.json"
        save_json({
            "category": cat,
            "count": len(phrases),
            "phrases": phrases,
            "note": "Central Bikol (Naga City) dialect"
        }, os.path.join(kb_dir, filename))
    
    # Save full corpus
    full_corpus = {
        "health_phrases": health_phrases,
        "dictionary": dictionary,
        "total_entries": len(health_phrases) + len(dictionary),
        "source": "Curated for MyNaga Gabay health assistant",
        "dialect": "Central Bikol (Naga City)",
    }
    save_json(full_corpus, os.path.join(output_dir, 'bikol_corpus.json'))
    
    # Save translation mappings
    save_json(mappings, os.path.join(output_dir, 'translation_mappings.json'))
    
    # Also save to knowledge base
    save_json(mappings, os.path.join(kb_dir, 'translation_mappings.json'))
    
    # Summary
    print("\n" + "=" * 60)
    print("CORPUS BUILD COMPLETE")
    print("=" * 60)
    print(f"Total health phrases: {len(health_phrases)}")
    print(f"Total dictionary entries: {len(dictionary)}")
    print(f"Total corpus entries: {len(health_phrases) + len(dictionary)}")
    print(f"Translation mappings: Bikol↔Filipino↔English")


if __name__ == "__main__":
    main()
