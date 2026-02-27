<script setup lang="ts">
// Можно вынести в отдельный файл
const styles = {
  // Контейнеры
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '960px',
    padding: '20px',
    paddingTop: '0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },
  
  // Типография
  text: {
    sm: { fontSize: '0.875rem' },
    gray: {
      500: { color: '#6b7280' },
      600: { color: '#4b5563' },
      900: { color: '#1f2937' }
    }
  },
  
  // Карточки результатов
  resultCard: {
    base: {
      padding: '12px',
      borderRadius: '4px'
    },
    blue: {
      backgroundColor: '#eff6ff'
    },
    green: {
      backgroundColor: '#f0fdf4'
    }
  },
  
  // Утилиты
  fontMono: {
    fontFamily: 'monospace'
  },
  textCenter: {
    textAlign: 'center' as const
  },
  grid: {
    cols2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }
  }
}
</script>