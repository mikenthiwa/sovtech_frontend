import {Fragment} from "react";
import styles from './custom-table.module.scss';

type Results = {
    name: string;
    gender: string;
    height: string;
    mass: string;
    homeworld: string;
}

type CustomTableProps = {
    theadData: string[]
    tbodyData: Array<Results>
}

const customTableComponent = ({theadData, tbodyData}: CustomTableProps) => {
    return (
        <table className={`${styles.customTable} table-auto w-full`}>
            <thead>
            <tr>
                { theadData.map((data, idx) => (
                    <th
                        className="py-2 px-1 bg-green-600 text-white text-left border-gray-300 border"
                        key={idx}>
                        {data}
                    </th>
                )) }
            </tr>
            </thead>
            <tbody>
                {
                    tbodyData.map(
                    ({name, gender, height, mass, homeworld}, idx) =>
                        (
                            <Fragment key={idx}>
                                <tr>
                                    <td className="py-1 border-gray-300 border">{name}</td>
                                    <td className="py-1 border-gray-300 border">{gender}</td>
                                    <td className="py-1 border-gray-300 border">{height}</td>
                                    <td className="py-1 border-gray-300 border">{mass}</td>
                                    <td className="py-1 border-gray-300 border">{homeworld}</td>
                                </tr>
                            </Fragment>
                        )
                    )
                }
            </tbody>
        </table>
    )
}

export default customTableComponent
