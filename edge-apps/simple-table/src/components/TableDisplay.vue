<template>
  <div class="table-container">
    <h2
      v-if="title && title.trim()"
      class="table-title"
    >
      {{ title }}
    </h2>
    <table
      v-if="data.length > 0"
      class="csv-table"
    >
      <thead v-if="headers.length > 0">
        <tr>
          <th
            v-for="(header, index) in headers"
            :key="index"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
        >
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-else
      class="no-data"
    >
      No data to display
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  data: string[][];
  title?: string;
}>();

const headers = computed(() => {
  return props.data.length > 0 ? props.data[0] : [];
});

const rows = computed(() => {
  return props.data.length > 1 ? props.data.slice(1) : [];
});
</script>

<style scoped lang="scss">
.table-container {
  width: 100%;
  overflow-x: auto;

  .csv-table {
    width: 100%;
    border-collapse: collapse;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;

    thead {
      th {
        background: var(--theme-color-header-bg, #2980b9);
        color: var(--theme-color-header-text, #ffffff);
        padding: 1rem 0.75rem;
        text-align: left;
        font-weight: bold;
        border-right: 1px solid var(--theme-color-header-bg, #2980b9);
        border-bottom: 1px solid var(--theme-color-header-bg, #2980b9);

        &:first-child {
          border-left: none;
          padding-left: 1.5rem;
        }

        &:last-child {
          border-right: none;
          text-align: right;
          padding-right: 1.5rem;
        }
      }
    }

    tbody {
      tr {
        td {
          padding: 0.75rem;
          border-right: 1px solid var(--theme-color-default-bg, #dee2e6);
          border-bottom: 1px solid var(--theme-color-default-bg, #dee2e6);
          color: var(--theme-color-default-text, #2c3e50);
          background: var(--theme-color-default-bg, #ffffff);

          &:first-child {
            border-left: none;
            padding-left: 1.5rem;
          }

          &:last-child {
            border-right: none;
            text-align: right;
            padding-right: 1.5rem;
          }
        }
      }
    }
  }

  .no-data {
    text-align: center;
    color: var(--theme-color-default-text, #7f8c8d);
    font-size: 1.2rem;
    padding: 2rem;
  }
}

.table-title {
  color: var(--theme-color-title-text, #2c3e50);
  background-color: var(--theme-color-title-bg, #f8f9fa);
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0;
  padding: 1rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 2em;
}
</style>
