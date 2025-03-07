import React from 'react'

interface ListProps {
  token : string | null
}

const List:React.FC<ListProps> = ({token}) => {
  return (
    <div>
      List
    </div>
  )
}

export default List
