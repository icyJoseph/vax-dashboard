import "./App.css";
import "@reach/dialog/styles.css";
import React, { Fragment, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import type { getTestCenters, getTestCenterInformation } from "civic-api";
import { Dialog } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";

type Await<T> = T extends {
  // eslint-disable-next-line
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

type Results = Await<ReturnType<typeof getTestCenters>>;
type TestCenterInfo = Await<ReturnType<typeof getTestCenterInformation>>;

const fetchCenter = (hsaid: string | null): Promise<TestCenterInfo> =>
  axios.get(`/api/get_by_hsaid?hsaid=${hsaid}`).then(({ data }) => data);

const Center = ({ selected }: { selected: string }) => {
  const { data, status } = useQuery(
    ["centers", selected],
    () => fetchCenter(selected),
    { enabled: !!selected }
  );

  if (status === "loading") return <div>Loading...</div>;
  console.log(data);

  return (
    <div>
      <h2>{data?.results?.[0].namn}</h2>
      <h3>{data?.results?.[0].foretag}</h3>
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

const Modal = ({
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
      {selected && <Center selected={selected} />}
    </Dialog>
  );
};

const Centers = () => {
  const { data: centers, status } = useQuery<Results>(["centers"], () =>
    axios.get("/api/get_all").then(({ data }) => data)
  );

  const client = useQueryClient();

  const [selected, setSelected] = useState<string | null>(null);
  const open = (id: string) => setSelected(id);
  const close = () => setSelected(null);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Something went wrong</div>;

  return (
    <Fragment>
      <Modal selected={selected} close={close} />
      <ul>
        {centers?.testcenters.map((center) => {
          return (
            <li
              key={center.hsaid}
              onMouseEnter={() => {
                client.prefetchQuery(
                  ["centers", center.hsaid],
                  () => fetchCenter(center.hsaid),
                  {
                    staleTime: 60 * 60 * 1000
                  }
                );
              }}
            >
              <a
                className="App-link"
                onClick={() => {
                  open(center.hsaid);
                }}
              >
                {center.title}
              </a>
              <p>Timeslots: {center.timeslots}</p>
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

function App() {
  return (
    <Fragment>
      <header className="App-header">
        <h1>Covid-19</h1>
        <p>Vaccination centers</p>
      </header>
      <main className="App-main">
        <Centers />
      </main>
    </Fragment>
  );
}

export default App;
