from flask import Blueprint, request, jsonify, send_from_directory
import csv
import os
import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

attacks_bp = Blueprint('attacks', __name__)

# Path to the CSV file
CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'cyberattacks.csv')


def parse_csv_file():
    """
    Parse the cyberattacks CSV file and convert to JSON format.
    Returns a list of attack event dictionaries.
    """
    try:
        if not os.path.exists(CSV_FILE_PATH):
            logger.error(f"CSV file not found at: {CSV_FILE_PATH}")
            return []

        attacks = []
        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as csvfile:
            csv_reader = csv.DictReader(csvfile)
            
            for row in csv_reader:
                # Map CSV columns to frontend expected format
                confidence_value = row.get('Confidence Score')
                try:
                    confidence = float(confidence_value) if confidence_value not in (None, '', ' ') else 0.0
                except ValueError:
                    confidence = 0.0
                attack_event = {
                    'detection': row.get('Detection Label', 'Not Detected'),
                    'Country': row.get('Source Country', row.get('SourceCountry', '')) ,
                    'AttackType': row.get('Attack Type', ''),
                    'AffectedSystem': row.get('Affected System', ''),
                    'Protocol': row.get('Protocol', ''),
                    'SourceIP': row.get('Source IP', ''),
                    'confidence': confidence
                }
                
                # Only include entries with valid country
                # if attack_event['Country']:
                #     attacks.append(attack_event)
                attack_event['Country'] = attack_event['Country'] or 'Unknown'
                attacks.append(attack_event)

        
        logger.info(f"Successfully parsed {len(attacks)} attack events from CSV")
        return attacks

    except Exception as e:
        logger.error(f"Error parsing CSV file: {e}")
        return []


@lru_cache(maxsize=1)
def get_cached_attacks():
    """
    Cached version of CSV parsing to improve performance.
    Cache is invalidated when server restarts.
    """
    return parse_csv_file()


@attacks_bp.route('/api/attacks', methods=['GET'])
def get_attacks():
    """
    Get all cyber attack events from the CSV file.
    
    Returns:
        JSON response with list of attack events
    """
    try:
        # Check if force refresh is requested
        force_refresh = request.args.get('refresh', 'false').lower() == 'true'
        
        if force_refresh:
            # Clear cache and reload
            get_cached_attacks.cache_clear()
            logger.info("Cache cleared, reloading data")
        
        # Get attack data (from cache or parse CSV)
        attacks = get_cached_attacks()
        
        if not attacks:
            return jsonify({
                'success': False,
                'message': 'No attack data available',
                'data': []
            }), 404

        return jsonify({
            'success': True,
            'message': f'Retrieved {len(attacks)} attack events',
            'data': attacks
        }), 200

    except Exception as e:
        logger.error(f"Error fetching attacks: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error while fetching attack data',
            'data': []
        }), 500


@attacks_bp.route('/api/attacks/summary', methods=['GET'])
def get_attacks_summary():
    """
    Get summary statistics of cyber attack events.
    
    Returns:
        JSON response with summary statistics
    """
    try:
        attacks = get_cached_attacks()
        
        if not attacks:
            return jsonify({
                'success': False,
                'message': 'No attack data available',
                'summary': {}
            }), 404

        # Calculate summary statistics
        total_attacks = len(attacks)
        detected_threats = len([a for a in attacks if a['detection'].lower() == 'detected'])
        countries_affected = len(set(a['Country'] for a in attacks if a['Country'] and a['Country'] != 'Unknown'))

        
        # Attack type distribution
        attack_types = {}
        for attack in attacks:
            attack_type = attack.get('AttackType', 'Unknown')
            attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
        
        # Protocol distribution
        protocols = {}
        for attack in attacks:
            protocol = attack.get('Protocol', 'Unknown')
            protocols[protocol] = protocols.get(protocol, 0) + 1
        
        # Affected systems distribution
        systems = {}
        for attack in attacks:
            system = attack.get('AffectedSystem', 'Unknown')
            systems[system] = systems.get(system, 0) + 1

        summary = {
            'total_attacks': total_attacks,
            'detected_threats': detected_threats,
            'countries_affected': countries_affected,
            'attack_types': attack_types,
            'protocols': protocols,
            'affected_systems': systems
        }

        return jsonify({
            'success': True,
            'message': 'Summary statistics retrieved successfully',
            'summary': summary
        }), 200

    except Exception as e:
        logger.error(f"Error fetching summary: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error while fetching summary',
            'summary': {}
        }), 500


@attacks_bp.route('/api/attacks/filter', methods=['POST'])
def filter_attacks():
    """
    Filter attack events based on provided criteria.
    
    Expected JSON body:
        {
            "country": string (optional),
            "attack_type": string (optional),
            "affected_system": string (optional),
            "protocol": string (optional),
            "detection": string (optional),
            "source_ip": string (optional)
        }
    
    Returns:
        JSON response with filtered attack events
    """
    try:
        attacks = get_cached_attacks()
        filters = request.get_json() or {}
        
        # Apply filters
        filtered = attacks
        
        if filters.get('country'):
            filtered = [a for a in filtered if a['Country'] == filters['country']]
        
        if filters.get('attack_type'):
            filtered = [a for a in filtered if a['AttackType'] == filters['attack_type']]
        
        if filters.get('affected_system'):
            filtered = [a for a in filtered if a['AffectedSystem'] == filters['affected_system']]
        
        if filters.get('protocol'):
            filtered = [a for a in filtered if a['Protocol'] == filters['protocol']]
        
        if filters.get('detection'):
            filtered = [a for a in filtered if a['detection'].lower() == filters['detection'].lower()]
        
        if filters.get('source_ip'):
            filtered = [a for a in filtered if filters['source_ip'] in (a['SourceIP'] or '')]

        return jsonify({
            'success': True,
            'message': f'Filtered to {len(filtered)} attack events',
            'data': filtered,
            'total': len(filtered)
        }), 200

    except Exception as e:
        logger.error(f"Error filtering attacks: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error while filtering attacks',
            'data': [],
            'total': 0
        }), 500


@attacks_bp.route('/api/attacks/stats', methods=['GET'])
def get_filter_options():
    """
    Get available filter options (unique values) for all fields.
    Useful for populating dropdown filters in the frontend.
    
    Returns:
        JSON response with unique values for each filterable field
    """
    try:
        attacks = get_cached_attacks()
        
        if not attacks:
            return jsonify({
                'success': False,
                'message': 'No attack data available',
                'options': {}
            }), 404

        # Get unique values for each field
        countries = sorted(list(set([a['Country'] for a in attacks if a['Country']])))
        attack_types = sorted(list(set([a['AttackType'] for a in attacks if a['AttackType']])))
        affected_systems = sorted(list(set([a['AffectedSystem'] for a in attacks if a['AffectedSystem']])))
        protocols = sorted(list(set([a['Protocol'] for a in attacks if a['Protocol']])))
        detections = sorted(list(set([a['detection'] for a in attacks if a['detection']])))

        options = {
            'countries': countries,
            'attack_types': attack_types,
            'affected_systems': affected_systems,
            'protocols': protocols,
            'detections': detections
        }

        return jsonify({
            'success': True,
            'message': 'Filter options retrieved successfully',
            'options': options
        }), 200

    except Exception as e:
        logger.error(f"Error fetching filter options: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error while fetching filter options',
            'options': {}
        }), 500