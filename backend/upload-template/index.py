import json
import os
import base64
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Создает или обновляет шаблон документа в базе данных
    Args: event - dict с httpMethod, body (name, fileContent в base64, опционально templateId)
          context - object с request_id
    Returns: HTTP response с результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method not in ['POST', 'PUT']:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        name = body_data.get('name', 'Шаблон заседания')
        file_content = body_data.get('fileContent', '')
        template_id = body_data.get('templateId')
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database connection not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if method == 'PUT' and template_id:
            if file_content:
                file_bytes = base64.b64decode(file_content)
                query = """
                    UPDATE templates 
                    SET name = %s, file_content = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id
                """
                cursor.execute(query, (name, psycopg2.Binary(file_bytes), template_id))
            else:
                query = """
                    UPDATE templates 
                    SET name = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id
                """
                cursor.execute(query, (name, template_id))
            
            result = cursor.fetchone()
            if not result:
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Template not found'})
                }
            result_id = result[0]
            message = 'Template updated successfully'
        else:
            if not file_content:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'File content is required'})
                }
            
            file_bytes = base64.b64decode(file_content)
            query = """
                INSERT INTO templates (name, file_content, created_at, updated_at)
                VALUES (%s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id
            """
            cursor.execute(query, (name, psycopg2.Binary(file_bytes)))
            result_id = cursor.fetchone()[0]
            message = 'Template uploaded successfully'
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'id': result_id,
                'message': message
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Upload error: {str(e)}'})
        }