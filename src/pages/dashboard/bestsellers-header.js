const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <td class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0].url}">
          </td>
        `
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<td class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </td>`
    }
  }
]

export default header
