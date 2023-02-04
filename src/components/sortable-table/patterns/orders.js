const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true
  },
  {
    id: 'createdAt',
    title: 'Дата',
    sortable: true,
    template: data => `
      <td class="sortable-table__cell">
        ${new Date(data).toLocaleString('ru', { dateStyle: 'medium' })}
      </td>`
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    template: data => `
      <td class="sortable-table__cell">
        $${data}
      </td>`
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true
  }
]

export default header
