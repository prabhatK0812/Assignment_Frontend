
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export interface Artwork {
  id: number;
  title: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: number;
  date_end?: number;
}

export const ArtTable: React.FC = () => {
  const [data, setData] = useState<Artwork[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const selectedMapRef = useRef<Map<number, Artwork>>(new Map());
  const [rowClick, setRowClick] = useState(false);

  const op = useRef<OverlayPanel>(null);
  const [overlayRows, setOverlayRows] = useState<number>(0);

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`
      );
      const json = await res.json();
      setData(json.data);
      setTotalRecords(json.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  useEffect(() => {
  console.log(data); 
}, [data]);

  

const onOverlaySelect = async () => {
  if (!overlayRows || overlayRows <= 0) return;

  const perPage = rowsPerPage; 
  const totalPages = Math.ceil(overlayRows / perPage);
  const newMap = new Map<number, Artwork>(selectedMapRef.current);

  for (let p = 1; p <= totalPages; p++) {
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${p}&limit=${perPage}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`
      );
      const json: { data: Artwork[] } = await res.json();
      const dataPage: Artwork[] = json.data;

      dataPage.forEach((r: Artwork) => {
        if (newMap.size < overlayRows) newMap.set(r.id, r);
      });
    } catch (err) {
      console.error(err);
    }
  }

  selectedMapRef.current = newMap;
  setSelectedArtworks(Array.from(newMap.values()));
  op.current?.hide();
};
  

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setRowsPerPage(event.rows);
    setPage(event.page + 1);
  };

  const currentSelection = data.filter((d) => selectedMapRef.current.has(d.id));

  const onSelectionChange = (e: any) => {
    const newMap = new Map(selectedMapRef.current);
    data.forEach((row) => {
      const isSelected = (e.value as Artwork[]).some((v) => v.id === row.id);
      if (isSelected) newMap.set(row.id, row);
      else newMap.delete(row.id);
    });
    selectedMapRef.current = newMap;
    setSelectedArtworks(Array.from(newMap.values()));
  };




  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h2 className="text-3xl font-bold mb-6 text-gray-800"> Art Institute Artworks</h2>

<div className="flex flex-wrap items-center gap-4 mb-4">

  {/* Label */}
  <span className="font-medium text-gray-700">Row Selection:</span>

  {/* Toggle */}
  <InputSwitch
    checked={rowClick}
    onChange={(e) => setRowClick(e.value)}
    className="transform  scale-90" 
  />



    <div className="relative"  onMouseEnter={(e) => op.current?.show(e, e.currentTarget)}  onMouseLeave={() => op.current?.hide()} >
      <Button
        type="button"
        className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
      >
        <span className="flex items-center justify-center w-5 h-5">
          <i className="pi pi-chevron-down"></i>
        </span>
        Select Rows
      </Button>
    
      <OverlayPanel
        ref={op}
        showCloseIcon={false} 
        className="p-4 rounded-md border border-gray-300 shadow-lg transition-opacity duration-200"
      >
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={overlayRows}
            onChange={(e) => setOverlayRows(parseInt(e.target.value))}
            placeholder="Rows"
            className="border border-gray-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button
            label="Submit"
            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-blue-100"
            onClick={onOverlaySelect}
          />
        </div>
      </OverlayPanel>
    </div>


</div>


      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {rowClick ? (
          <DataTable
            value={data}
            selection={selectedArtworks[0] ?? null}
            selectionMode="single"
            onSelectionChange={(e) => setSelectedArtworks(e.value ? [e.value] : [])}
            dataKey="id"
            loading={loading}
            showGridlines
            responsiveLayout="scroll"
          >
            <Column field="title" header="Title" style={{ width: "20%" }} ></Column>
            <Column field="place_of_origin" header="Origin" style={{ width: "20%" }} ></Column>
            <Column field="artist_display" header="Artist" style={{ width: "20%" }} ></Column>
            <Column field="inscriptions" header="Inscriptions" style={{ width: "20%" }}  body={(rowData) => rowData.inscriptions || "N/A"} ></Column>
            <Column field="date_start" header="Start Year"  style={{ width: "10%" }}></Column>
            <Column field="date_end" header="End Year" style={{ width: "10%" }} ></Column>
          </DataTable>
        ) : (
          <DataTable
            value={data}
            selection={currentSelection}
            selectionMode="checkbox"
            onSelectionChange={onSelectionChange}
            dataKey="id"
            loading={loading}
            showGridlines
            // responsiveLayout="scroll"

  // className="text-sm border border-gray-200 rounded-lg overflow-x-auto"
  className="text-sm border border-gray-300 rounded-lg overflow-x-auto shadow-sm"
  tableStyle={{ minWidth: '50rem' }}
  rowClassName={(_, options: any) =>
    options.index % 2 === 0
      ? "bg-gray-50 hover:bg-blue-50"
      : "bg-white hover:bg-blue-50"
  }           
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            <Column field="title" header="Title" style={{ width: "20%" }} ></Column>
            <Column field="place_of_origin" header="Origin"  style={{ width: "20%" }} ></Column>
            <Column field="artist_display" header="Artist" style={{ width: "20%" }} ></Column>
            <Column field="inscriptions" header="Inscriptions" style={{ width: "20%" }}  body={(rowData) => rowData.inscriptions || "N/A"} ></Column>
            <Column field="date_start" header="Start Year" style={{ width: "10%" }} ></Column>
            <Column field="date_end" header="End Year" style={{ width: "10%" }} ></Column>
          </DataTable>
        )}
      </div>

      <Paginator
        first={(page - 1) * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
        className="mt-6 flex justify-center items-center gap-4 border border-gray-400 rounded-lg p-3 bg-white shadow-sm custom-paginator"
      />

      <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-4">
        <strong>Selected Artworks:</strong>{" "}
        <span className="text-gray-700">
          {selectedArtworks.map((a) => a.title).join(", ") || "None"}
        </span>
      </div>
    </div>
  );
};

