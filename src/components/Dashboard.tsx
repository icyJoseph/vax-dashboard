import React, { Fragment, useReducer, useState } from "react";
import axios from "axios";

import { useQuery, useQueryClient } from "react-query";
import { Dialog } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import type { getTestCenters, getTestCenterInformation } from "civic-api";

type Await<T> = T extends {
  // eslint-disable-next-line
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

type Results = Await<ReturnType<typeof getTestCenters>>;
type TestCenterInfo = Await<ReturnType<typeof getTestCenterInformation>>;

const fetchGeoInfo = (hsaid: string | null): Promise<TestCenterInfo> =>
  axios.get(`/api/get_by_hsaid?hsaid=${hsaid}`).then(({ data }) => data);

const GeoInfo = ({ selected }: { selected: string }) => {
  const { data, status } = useQuery(
    ["geo", selected],
    () => fetchGeoInfo(selected),
    { enabled: !!selected }
  );

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error getting info</div>;

  if (data?.results?.length === 0) return <div>No data available</div>;

  return (
    <div>
      <h3>{data?.results?.[0].namn}</h3>
      <h4>{data?.results?.[0].foretag}</h4>
      <address>
        {data?.results?.[0].postnummer} {data?.results?.[0].postort}
      </address>
      <figure>
        <figcaption>Coordinates</figcaption>
        <pre>
          x: {data?.results?.[0].xkoord} y: {data?.results?.[0].ykoord}
        </pre>
      </figure>
    </div>
  );
};

const GeoModal = ({
  selected,
  close
}: {
  selected: string | null;
  close: () => void;
}) => {
  const open = !!selected;

  return (
    <Dialog isOpen={open} onDismiss={close} aria-label="Vaccination Center">
      <button className="close-button" onClick={close}>
        <VisuallyHidden>Close</VisuallyHidden>
        <span aria-hidden>×</span>
      </button>
      {selected && <GeoInfo selected={selected} />}
    </Dialog>
  );
};

export const Dashboard = () => {
  const { data, status, isFetching } = useQuery<Results>(["centers"], () =>
    axios.get("/api/get_all").then(({ data }) => data)
  );

  const client = useQueryClient();

  const revalidate = () => client.invalidateQueries(["centers"]);

  const [selected, setSelected] = useState<string | null>(null);
  const open = (id: string) => setSelected(id);
  const close = () => setSelected(null);

  const [hide, toggle] = useReducer((x) => !x, true);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Something went wrong</div>;

  return (
    <Fragment>
      <div className="App-controls">
        <button onClick={toggle}>{hide ? "Show All" : "Hide Empty"}</button>
        <button onClick={revalidate}>
          {isFetching ? "Loading" : "Refresh"}
        </button>
      </div>
      <GeoModal selected={selected} close={close} />
      <ul>
        {data?.testcenters
          .filter((center) => {
            if (hide) {
              return center.timeslots > 0;
            }
            return center;
          })
          .map((center) => {
            return (
              <li
                key={center.hsaid}
                onMouseEnter={() => {
                  client.prefetchQuery(
                    ["geo", center.hsaid],
                    () => fetchGeoInfo(center.hsaid),
                    {
                      staleTime: Infinity
                    }
                  );
                }}
              >
                <h2>{center.title}</h2>
                <p>Timeslots: {center.timeslots}</p>
                <time dateTime={new Date(center.updated).toISOString()}>
                  Updated {center.updated}
                </time>
                <p>
                  <a
                    className="App-link"
                    onClick={() => {
                      open(center.hsaid);
                    }}
                  >
                    Address
                  </a>
                </p>
                <p>
                  <a
                    href={center.urlBooking}
                    target="_blank"
                    rel="noopener noreferer"
                  >
                    Bookings
                  </a>
                </p>
              </li>
            );
          })}
      </ul>
    </Fragment>
  );
};
