import { useEffect, useState } from "preact/hooks";
import { LoaderReturnType } from "$live/types.ts";

import CompaniesCard from "./CompaniesCard.tsx";
import CompaniesCardLoader from "./CompaniesCardLoader.tsx";
import CompaniesFilter from "./CompaniesFilter.tsx";
import LoadingIcon from "../utils/LoadingIcon.tsx";
import type {
  Company,
  FilterList,
} from "deco-sites/madeinbraziltec/routes/api/companies.ts";

export type Props = {
  filterList: LoaderReturnType<FilterList[]>;
};

enum OrderBy {
  MOST_POPULAR = "companyUpvotes",
  NEWEST = "createdTime",
}

interface CompanyResponse {
  data: Company[];
  status: number;
}

interface SelectedFilters {
  name: string;
  values: string[];
}

export default function CompaniesList({ filterList }: Props) {
  const [isCardClicked, setCardClicked] = useState(false);
  const [orderBy, setOrderBy] = useState(OrderBy.MOST_POPULAR);
  const [companiesList, setCompaniesList] = useState([] as Company[]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = (showReload = true) => {
    const queryString = selectedFilters.reduce((acc, curr) => {
      const values = curr.values.join(",");
      return `${acc}&${curr.name}=${values}`;
    }, "");

    showReload && setIsLoading(true);
    fetch(
      `/api/companies?orderBy=${orderBy}${queryString}`,
      {
        method: "GET",
      },
    ).then((res) => res.json()).then(
      (data: CompanyResponse) => {
        setCompaniesList(data.data);
      },
    ).finally(() => {
      showReload && setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchCompanies();
  }, [orderBy]);

  const applyFilters = () => {
    fetchCompanies();
  };

  const clearFilters = (filterName: string) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = prevFilters.filter((filter) =>
        filter.name !== filterName
      );
      return newFilters;
    });
  };

  const handleOrderBy = () => {
    setOrderBy(() => {
      if (orderBy === OrderBy.MOST_POPULAR) {
        return OrderBy.NEWEST;
      }
      return OrderBy.MOST_POPULAR;
    });
  };

  const handleSelectedFilters = (
    option: string | number,
    filter: FilterList,
  ) => {
    setSelectedFilters((prevFilters) => {
      const optionString = option.toString();

      const filterIndex = prevFilters.findIndex((selectedFilter) =>
        selectedFilter.name === filter.name
      );

      if (filterIndex === -1) {
        const newFilter = {
          name: filter.name,
          values: [optionString],
        };
        return [...prevFilters, newFilter];
      }

      const selectedValues = prevFilters[filterIndex].values;
      const valueIndex = selectedValues.findIndex((value) =>
        value === optionString
      );

      if (valueIndex !== -1) {
        const newSelectedFilters = [...prevFilters];
        newSelectedFilters[filterIndex].values.splice(valueIndex, 1);
        return newSelectedFilters;
      }

      const newSelectedFilters = [...prevFilters];
      newSelectedFilters[filterIndex].values.push(optionString);
      return newSelectedFilters;
    });
  };

  return (
    <div className="min-h-[calc(100vh-98px)] text-zinc-100 flex justify-between flex-col md:px-10 mx-auto bg-gradient-to-r from-yellow-opaque from-50% to-green-opaque to-50%">
      <div className="flex flex-col mx-auto max-w-[1440px] min-h-[calc(100vh-98px)] w-full bg-white border-x-2 border-black border-opacity-20 pt-14 px-14">
        <button
          onClick={() => handleOrderBy()}
          className="flex bg-gray-opaque rounded-[40px] w-fit hover:bg-opacity-80 transition-all ease-in-out"
        >
          <div className="flex it ems-center px-2 py-3">
            <span
              className={`${
                orderBy === OrderBy.MOST_POPULAR
                  ? "text-white bg-primary"
                  : "text-secondary"
              } font-medium text-base px-4 py-3 rounded-[40px] transition-all ease-in-out`}
            >
              MOST POPULAR
            </span>
            <span
              className={`${
                orderBy === OrderBy.NEWEST
                  ? "text-white bg-primary"
                  : "text-secondary"
              } font-medium text-base px-4 py-3 rounded-[40px] transition-all ease-in-out`}
            >
              NEWEST
            </span>
          </div>
        </button>
        <div className="flex flex-col justify-between items-center mt-14">
          <div className="flex flex-wrap justify-start gap-4 w-full transition-all ease-in-out">
            {filterList.map((filter) => (
              <CompaniesFilter
                key={filter.name}
                filter={filter}
                handleSelectedFilters={handleSelectedFilters}
                selectedFilters={selectedFilters}
                applyFilters={applyFilters}
                clearFilters={clearFilters}
                isLoading={isLoading}
              />
            ))}
          </div>
          <div className="w-full">
            <div className="mt-14 w-full">
              {isLoading
                ? (
                  <div className="grid min-[744px]:grid-cols-2 min-[744px]:gap-8 min-[1024px]:gap-12 min-[1440px]:grid-cols-3 auto-cols-max w-full">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <CompaniesCardLoader key={index} />
                    ))}
                  </div>
                )
                : companiesList.length
                ? (
                  <div className="grid min-[744px]:grid-cols-2 min-[744px]:gap-8 min-[1024px]:gap-12 min-[1440px]:grid-cols-3 w-full">
                    {companiesList.map((company) => (
                      <CompaniesCard
                        key={company.id}
                        company={company}
                        isCardClicked={isCardClicked}
                        orderBy={orderBy}
                        setIsCardClicked={setCardClicked}
                        fetchCompanies={fetchCompanies}
                      />
                    ))}
                  </div>
                )
                : (
                  <div className="flex justify-center items-center h-[calc(100vh-98px)]">
                    <h1 className="text-3xl">No companies found</h1>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
