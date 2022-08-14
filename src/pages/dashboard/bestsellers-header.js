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
    id: 'subcategory',
    title: 'Category',
    sortable: false,
    sortType: 'number',
    template: data => {
      const { title: subTitle } = data
      const { title: catTitle } = data.category

      const tooltip = `
      <div class=&quot;sortable-table-tooltip&quot;>
        <span class=&quot;sortable-table-tooltip__category&quot;>${catTitle}</span> /
        <b class=&quot;sortable-table-tooltip__subcategory&quot;>${subTitle}</b>
      </div>`

      return `<td class="sortable-table__cell">
      <span data-tooltip="${tooltip}">${subTitle}</span></td>`
    }
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
