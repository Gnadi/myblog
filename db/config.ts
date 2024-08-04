import { defineDb, defineTable, column } from 'astro:db';

const Contact = defineTable({
  columns: {
    mail: column.text(),
  }
})

export default defineDb({
  tables: { Contact },
})