<template>
  <div class="table-container">
    <h3
      v-if="title"
      :style="{
        paddingTop: '1rem',
        paddingBottom: '1rem',
        paddingLeft: '1.5rem',
        textAlign: 'center',
      }"
    >
      {{ title }}
    </h3>
    <table v-if="data.length > 0" class="csv-table">
      <thead v-if="headers && headers.length > 0">
        <tr>
          <th v-for="(header, index) in headers" :key="index">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="no-data">No data to display</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: string[][]
  title?: string
}>()

const headers = computed(() => {
  return props.data.length > 0 ? props.data[0] : []
})

const rows = computed(() => {
  return props.data.length > 1 ? props.data.slice(1) : []
})
</script>

<style scoped lang="scss">
.table-container {
  width: 100%;
  overflow-x: auto;

  .csv-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-family-primary, Aeonik, sans-serif);

    thead {
      th {
        background: var(--theme-color-secondary, #adafbe);
        color: var(--theme-color-tertiary, #ffffff);
        padding: 1rem 0.75rem;
        text-align: left;
        font-weight: bold;
        border: none;
        position: sticky;
        top: 0;
        z-index: 1;

        &:first-child {
          padding-left: 1.5rem;
        }

        &:last-child {
          text-align: right;
          padding-right: 1.5rem;
        }
      }
    }

    tbody {
      tr {
        &:nth-child(even) {
          background-color: rgba(255, 255, 255, 0.1);
        }

        td {
          padding: 0.75rem;
          color: var(--theme-color-tertiary, #ffffff);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);

          &:first-child {
            padding-left: 1.5rem;
          }

          &:last-child {
            text-align: right;
            padding-right: 1.5rem;
          }
        }
      }
    }
  }

  .no-data {
    text-align: center;
    color: var(--theme-color-tertiary, #ffffff);
    font-size: 1.2rem;
    padding: 2rem;
    font-family: var(--font-family-primary, Aeonik, sans-serif);
  }
}
</style>
