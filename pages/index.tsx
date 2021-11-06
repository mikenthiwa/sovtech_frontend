import type { NextPage } from 'next';
import { useRouter } from 'next/router'
import  { useQuery } from '@apollo/client'
import { GetStaticProps, GetStaticPaths } from "next";
import Pagination from "@mui/material/Pagination";
import ReactPaginate from 'react-paginate';
import {initializeApollo} from "../libs/apollo";
import CustomTableComponent from "../src/components/custom-table.component";
import swapiService from "../src/graphql/query/swapi.service";
import {useEffect, useState} from "react";

type State = () => undefined | number;

interface Props {
  response: any
}

interface People {
  people: Data
}

interface Data {
  next: string;
  previous: string;
  count: number;
  results: Array<string>;
}

interface Response {
  loading: boolean;
  data: People;
}

const client = initializeApollo();

const tableHead = ['Name', 'Gender', "Mass", "Height", "Homeworld"];

const Home: NextPage<Props> = (props) => {
  const { svrQuery: { page }} = props;
  console.log('server query', page);
  const { pathname, query, replace } = useRouter();
  const [currentPageNumber, setPageNumber] = useState(parseInt(page));
  const { loading, data, error, fetchMore} = useQuery(swapiService, {
    variables: {
      page: currentPageNumber
    }
  });

  const loadMore = (pageNumber: any) => {
    fetchMore({
      variables: {page: pageNumber}
    })
        .then(value => console.log('value', value))
        .catch(error => console.log('error', error))
  }

  const paginationHandler = async (event, page) => {
    setPageNumber(page);
    console.log('pathname .. query', pathname, query);
    await replace({pathname, query: {page}})
    loadMore(page)

  }

  return (
    <div
        className="h-screen sm:w-full  mx-auto md:w-9/12"
    >
        {!loading
            ? (
                <div>
                  <CustomTableComponent theadData={tableHead} tbodyData={ data.people.results} />
                  <Pagination onChange={paginationHandler} count={data.people.count} page={currentPageNumber} />
                </div>

            )
            : <div>Loading...</div>
        }


    </div>
  )
}

// export const getStaticPaths: GetStaticPaths = async () => {
//   const {loading, data: { people: { count}}}: Response
//       = await client.query({
//     query: swapiService,
//     variables: {pages: 1}
//   });
//
//   return {
//     paths: [{params: { index: '1'}}],
//     fallback: false,
//   }
// }

// export const  getStaticProps: GetStaticProps = async ({params: { index }}: {params: {index: string}}) => {
//   console.log('index', index)
//   try {
//     const {loading, data: { people: { next, previous, count, results }}}: Response
//         = await client.query({
//       query: swapiService,
//       variables: {pages: parseInt(index) || 1}
//     });
//     return {
//       props: {
//         response: { data: {next, previous, count, results}, loading },
//         pageNumber: parseInt(index)
//       }
//     }
//   }catch (err) {
//     throw err;
//   }
//
// }

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      svrQuery: ctx.query
    }, // will be passed to the page component as props
  };
}

export default Home;
