import { gql } from '@apollo/client';

const swapiService = gql`
 query getPeople($page: Int) {
   people(page: $page) {
     next
     previous
     count
     results {
        name
        gender
        height
        mass
        homeworld
     }
   }
 }
`

export default swapiService;
