import React, { useState } from 'react'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'
import { ListFilters } from '@/contexts/list/index.type'

const ResidentialPropertiesTemplate: React.FC = () => {
  const [filters] = useState<ListFilters>({
    search: '',
    perPage: 10,
    page: 1,
  })

  return (
    <div className='space-y-6'>
      <ResidentialFilterResponsive />
      <div className='text-sm text-muted-foreground'>
        <p>Filters: {JSON.stringify(filters)}</p>
      </div>
    </div>
  )
}

export default ResidentialPropertiesTemplate
