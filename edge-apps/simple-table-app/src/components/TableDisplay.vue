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

<template>
  <div class="table-container">
    <h3 v-if="title" class="table-title">
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

<style scoped lang="scss">
@use '@/assets/table-display.scss';
</style>
