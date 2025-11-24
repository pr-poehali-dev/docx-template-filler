import json
import re
import base64
from typing import Dict, Any, Optional, List
from io import BytesIO
from docx import Document

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Анализирует DOCX файл представления и извлекает данные
    Args: event - dict с httpMethod, body (base64 encoded DOCX)
          context - object с request_id
    Returns: HTTP response с извлеченными данными
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        file_content = body_data.get('fileContent', '')
        
        if not file_content:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'File content is required'})
            }
        
        docx_bytes = base64.b64decode(file_content)
        doc = Document(BytesIO(docx_bytes))
        
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        
        result = extract_data(text)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps(result, ensure_ascii=False)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Parsing error: {str(e)}'})
        }


def extract_data(text: str) -> Dict[str, Any]:
    data = {
        'fio': extract_fio(text),
        'birthDate': extract_birth_date(text),
        'rank': extract_rank(text),
        'position': extract_position(text),
        'militaryUnit': extract_military_unit(text),
        'serviceType': extract_service_type(text),
        'complaints': extract_complaints(text),
        'traumaDate': extract_trauma_date(text),
        'hospitalizationDate': extract_hospitalization_date(text),
        'traumaCircumstances': extract_trauma_circumstances(text),
        'diagnosis': extract_diagnosis(text),
        'contractDate': None,
        'contractSigner': None,
        'mobilizationDate': None,
        'mobilizationSource': None
    }
    
    if data['serviceType'] == 'contract':
        contract_info = extract_contract_info(text)
        data['contractDate'] = contract_info.get('date')
        data['contractSigner'] = contract_info.get('signer')
    elif data['serviceType'] == 'mobilization':
        mob_info = extract_mobilization_info(text)
        data['mobilizationDate'] = mob_info.get('date')
        data['mobilizationSource'] = mob_info.get('source')
    
    return data


def extract_fio(text: str) -> Optional[str]:
    patterns = [
        r'([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)',
        r'ФИО[:\s]+([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return None


def extract_birth_date(text: str) -> Optional[str]:
    patterns = [
        r'(\d{2}\.\d{2}\.\d{4})\s*г\.?\s*р',
        r'дата\s+рождения[:\s]+(\d{2}\.\d{2}\.\d{4})',
        r'родился[:\s]+(\d{2}\.\d{2}\.\d{4})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return format_date(match.group(1))
    return None


def extract_rank(text: str) -> Optional[str]:
    ranks = [
        'рядовой', 'ефрейтор', 'младший сержант', 'сержант', 'старший сержант',
        'старшина', 'прапорщик', 'старший прапорщик', 'младший лейтенант',
        'лейтенант', 'старший лейтенант', 'капитан', 'майор', 'подполковник',
        'полковник', 'генерал-майор', 'генерал-лейтенант', 'генерал-полковник',
        'генерал армии', 'маршал'
    ]
    
    text_lower = text.lower()
    for rank in sorted(ranks, key=len, reverse=True):
        if rank in text_lower:
            return rank.title()
    
    return None


def extract_position(text: str) -> Optional[str]:
    pattern = r'должность[:\s]+([^\n]+)'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        position = match.group(1).strip()
        return position[:100]
    
    return None


def extract_military_unit(text: str) -> Optional[str]:
    patterns = [
        r'(в/ч\s*\d+)',
        r'(воинская\s+часть\s*\d+)',
        r'в\.ч\.\s*(\d+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None


def extract_service_type(text: str) -> str:
    text_lower = text.lower()
    
    if 'мобилизац' in text_lower or 'мобилизован' in text_lower:
        return 'mobilization'
    elif 'контракт' in text_lower:
        return 'contract'
    
    return 'unknown'


def extract_complaints(text: str) -> Optional[str]:
    patterns = [
        r'жалоб[ауы]?[:\s-]+([^\n]+)',
        r'жалуется[:\s-]+([^\n]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()[:200]
    return None


def extract_trauma_date(text: str) -> Optional[str]:
    patterns = [
        r'дата\s+(?:травм[ыы]|заболевания)[:\s-]+(\d{2}\.\d{2}\.\d{4})',
        r'(?:травм[аи]|заболевание)\s+от[:\s-]?(\d{2}\.\d{2}\.\d{4})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return format_date(match.group(1))
    return None


def extract_hospitalization_date(text: str) -> Optional[str]:
    patterns = [
        r'дата\s+госпитализац[ии][:\s-]+(\d{2}\.\d{2}\.\d{4})',
        r'госпитализирован[аы]?[:\s-]+(\d{2}\.\d{2}\.\d{4})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return format_date(match.group(1))
    return None


def extract_trauma_circumstances(text: str) -> Optional[str]:
    patterns = [
        r'обстоятельств[аы]\s+(?:травм[ыы]|заболевания)[:\s-]+([^\n]+)',
        r'получил(?:а)?\s+(?:травм[уы]|заболевание)[:\s-]+([^\n]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()[:200]
    return None


def extract_diagnosis(text: str) -> Optional[str]:
    patterns = [
        r'диагноз[:\s-]+([^\n]+)',
        r'поставлен\s+диагноз[:\s-]+([^\n]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()[:200]
    return None


def extract_contract_info(text: str) -> Dict[str, Optional[str]]:
    info = {'date': None, 'signer': None}
    
    date_pattern = r'контракт[^\n]*?(\d{2}\.\d{2}\.\d{4})'
    date_match = re.search(date_pattern, text, re.IGNORECASE)
    if date_match:
        info['date'] = format_date(date_match.group(1))
    
    signer_pattern = r'подписан[:\s]+([^\n]+)'
    signer_match = re.search(signer_pattern, text, re.IGNORECASE)
    if signer_match:
        info['signer'] = signer_match.group(1).strip()[:100]
    
    return info


def extract_mobilization_info(text: str) -> Dict[str, Optional[str]]:
    info = {'date': None, 'source': None}
    
    date_pattern = r'мобилизац[^\n]*?(\d{2}\.\d{2}\.\d{4})'
    date_match = re.search(date_pattern, text, re.IGNORECASE)
    if date_match:
        info['date'] = format_date(date_match.group(1))
    
    source_pattern = r'(военкомат[^\n]+)'
    source_match = re.search(source_pattern, text, re.IGNORECASE)
    if source_match:
        info['source'] = source_match.group(1).strip()[:100]
    
    return info


def format_date(date_str: str) -> str:
    '''Конвертирует дату из формата дд.мм.гггг в дд месяц гггг'''
    months = {
        '01': 'января', '02': 'февраля', '03': 'марта', '04': 'апреля',
        '05': 'мая', '06': 'июня', '07': 'июля', '08': 'августа',
        '09': 'сентября', '10': 'октября', '11': 'ноября', '12': 'декабря'
    }
    
    parts = date_str.split('.')
    if len(parts) == 3:
        day, month, year = parts
        month_name = months.get(month, month)
        return f'{day} {month_name} {year}'
    
    return date_str