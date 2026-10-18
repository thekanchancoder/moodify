import React from 'react'
import FaceExpression from '../../expression/components/FaceExpression'
import { useSong } from '../hooks/useSong'

const Home = () => {
  const { handleGetSong } = useSong()
  return (
    <FaceExpression onClick={(expression) => { handleGetSong({ mood: expression }) }} />
  )
}

export default Home