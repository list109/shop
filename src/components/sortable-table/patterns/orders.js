const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true
  },
  {
    id: 'user',
    title: 'Client',
    sortable: true
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    template: data => `
      <td class="sortable-table__cell">
        ${new Date(data).toLocaleString('en', { dateStyle: 'medium' })}
      </td>`
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    template: data => `
      <td class="sortable-table__cell">
        $${data}
      </td>`
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true
  }
]

export default header
