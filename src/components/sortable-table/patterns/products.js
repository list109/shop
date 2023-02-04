const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
          <td class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
          </td>
        `
    }
  },
  {
    id: 'title',
    title: 'Имя',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Категория',
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
    title: 'Количество',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Цена',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<td class="sortable-table__cell">
          ${data > 0 ? 'Активен' : 'Не активен'}
        </td>`
    }
  }
]

export default header
