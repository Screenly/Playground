<template>
  <div class="main-container">
    <div class="primary-container">
      <div v-if="tableTitle && tableTitle.trim()" class="row-container">
        <InfoCard
          :value="tableTitle"
          class="title-card"
        />
        <InfoCard class="clock-card">
          <DigitalClock />
        </InfoCard>
      </div>
      <InfoCard v-if="tableData.length > 0" class="table-card">
        <TableDisplay :data="tableData" />
      </InfoCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from "vue";
import { defineStore } from "pinia";
import { baseSettingsStoreSetup } from "blueprint/stores/base-settings-store";
import { InfoCard, DigitalClock } from "blueprint/components";
import TableDisplay from "./components/TableDisplay.vue";

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
);

const baseSettingsStore = useBaseSettingsStore();

const tableData = ref<string[][]>([]);
const tableTitle = ref<string>("");

const parseCsv = async (text: string): Promise<string[][]> => {
  const Papa = (await import('papaparse')).default;

  const result = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }

  return result.data as string[][];
};


onBeforeMount(() => {
  baseSettingsStore.setupTheme();
});

onMounted(async () => {
  // Get CSV content and title from screenly settings
  if (typeof screenly !== "undefined" && screenly.settings?.content) {
    try {
      tableData.value = await parseCsv(screenly.settings.content);
      tableTitle.value = (screenly.settings.title as string) || "";
      screenly.signalReadyForRendering();
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      screenly.signalReadyForRendering();
    }
  }
});
</script>

<style scoped lang="scss">
.primary-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.row-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 100%;
  height: auto;
}

.title-card {
  flex: 1;
  height: auto;
  min-height: auto;
}

:deep(.title-card .primary-card) {
  justify-content: center;
  align-items: center;
}

:deep(.title-card .icon-card-text) {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.clock-card {
  flex: 0 0 auto;
  width: auto;
  min-width: 200px;
}

:deep(.clock-card .primary-card) {
  justify-content: center;
  align-items: center;
}

.table-card {
  flex: 1 1 0;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

:deep(.table-container) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.csv-table) {
  flex: 1;
  height: 0;
  overflow: auto;
}
</style>
