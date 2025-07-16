/* global */

// Utility functions for Strava Club Leaderboard App
window.StravaUtils = (function() {
  'use strict';

  // Locale detection
  function getUserLocale() {
    return navigator.language || navigator.languages?.[0] || 'en-US';
  }

  function getNumberFormatter(locale) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  // Check if locale uses imperial units (primarily US)
  function usesImperialUnits(locale) {
    // More comprehensive check for US-based locales
    return locale === 'en-US' ||
           locale.startsWith('en-US') ||
           locale === 'en-LR' ||
           locale === 'en-MM' ||
           locale.startsWith('en-LR') ||
           locale.startsWith('en-MM');
  }

  // Distance formatting
  function formatDistance(meters) {
    const locale = getUserLocale();
    const formatter = getNumberFormatter(locale);
    const useImperial = usesImperialUnits(locale);

    if (useImperial) {
      // Convert to miles for imperial units
      const miles = meters * 0.000621371;

      // For fitness activities, prefer miles for distances over ~500 feet (0.095 miles)
      if (miles >= 0.05) {
        return formatter.format(miles) + ' mi';
      } else {
        // For very short distances, show feet
        const feet = meters * 3.28084;
        return formatter.format(Math.round(feet)) + ' ft';
      }
    } else {
      // Use metric system
      if (meters >= 1000) {
        return formatter.format(meters / 1000) + ' km';
      }
      return formatter.format(Math.round(meters)) + ' m';
    }
  }

  // Time formatting
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      // For brevity, use abbreviated form
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }

  // Elevation formatting
  function formatElevation(meters) {
    const locale = getUserLocale();
    const formatter = getNumberFormatter(locale);
    const useImperial = usesImperialUnits(locale);

    if (useImperial) {
      // Convert to feet for imperial units
      const feet = meters * 3.28084;
      return formatter.format(Math.round(feet)) + ' ft';
    } else {
      // Use metric system
      return formatter.format(Math.round(meters)) + ' m';
    }
  }

  // Date formatting
  function formatDate(dateString) {
    const date = new Date(dateString);
    const locale = getUserLocale();

    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Localized text
  function getLocalizedText(key, locale) {
    const texts = {
      'en': {
        'updated': 'Updated',
        'activity': 'activity',
        'activities': 'activities',
        'distance': 'Distance',
        'time': 'Time',
        'average': 'Average'
      },
      'es': {
        'updated': 'Actualizado',
        'activity': 'actividad',
        'activities': 'actividades',
        'distance': 'Distancia',
        'time': 'Tiempo',
        'average': 'Promedio'
      },
      'fr': {
        'updated': 'Mis à jour',
        'activity': 'activité',
        'activities': 'activités',
        'distance': 'Distance',
        'time': 'Temps',
        'average': 'Moyenne'
      },
      'de': {
        'updated': 'Aktualisiert',
        'activity': 'Aktivität',
        'activities': 'Aktivitäten',
        'distance': 'Entfernung',
        'time': 'Zeit',
        'average': 'Durchschnitt'
      },
      'it': {
        'updated': 'Aggiornato',
        'activity': 'attività',
        'activities': 'attività',
        'distance': 'Distanza',
        'time': 'Tempo',
        'average': 'Media'
      },
      'pt': {
        'updated': 'Atualizado',
        'activity': 'atividade',
        'activities': 'atividades',
        'distance': 'Distância',
        'time': 'Tempo',
        'average': 'Média'
      },
      'nl': {
        'updated': 'Bijgewerkt',
        'activity': 'activiteit',
        'activities': 'activiteiten',
        'distance': 'Afstand',
        'time': 'Tijd',
        'average': 'Gemiddeld'
      }
    };

    const languageCode = locale.split('-')[0];
    const languageTexts = texts[languageCode] || texts['en'];
    return languageTexts[key] || texts['en'][key];
  }

  // Activity and rank icons
  function getActivityIcon(type) {
    const icons = {
      'Run': '🏃‍♂️',
      'Ride': '🚴‍♂️',
      'Swim': '🏊‍♂️',
      'Hike': '🥾',
      'Walk': '🚶‍♂️',
      'Workout': '💪',
      'Yoga': '🧘‍♂️',
      'Default': '🏃‍♂️'
    };
    return icons[type] || icons['Default'];
  }

  function getRankIcon(rank) {
    const icons = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };
    return icons[rank] || '';
  }

  // Debug function for testing locale and units
  function testLocale() {
    const locale = getUserLocale();
    const useImperial = usesImperialUnits(locale);
    console.log('Current locale:', locale);
    console.log('Uses imperial units:', useImperial);
    console.log('Test distances:');
    console.log('100m:', formatDistance(100));
    console.log('1000m:', formatDistance(1000));
    console.log('5000m:', formatDistance(5000));
    console.log('10000m:', formatDistance(10000));
    console.log('42195m:', formatDistance(42195)); // Marathon distance
  }

  // Public API
  return {
    getUserLocale,
    getNumberFormatter,
    usesImperialUnits,
    formatDistance,
    formatTime,
    formatElevation,
    formatDate,
    getLocalizedText,
    getActivityIcon,
    getRankIcon,
    testLocale
  };

})();