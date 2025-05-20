// src/components/common/form/FormGeoSearchField.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import throttle from "lodash/throttle";
import "leaflet-geosearch/dist/geosearch.css";

interface GeoSearchResult {
  x: number; // longitude
  y: number; // latitude
  label: string; // formatted address
  bounds: [
    [number, number], // south, west - lat, lon
    [number, number], // north, east - lat, lon
  ];
  raw: any; // raw provider result
}

export const FormGeoSearchField = ({
  label,
  name,
  icon,
  required = false,
  onChange,
  value,
}: {
  label: string;
  name: string;
  icon: React.ReactElement;
  required?: boolean;
  onChange?: (value: GeoSearchResult | null) => void;
  value?: GeoSearchResult | null;
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<GeoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize the OpenStreetMapProvider
  const provider = useMemo(() => {
    if (typeof window !== "undefined") {
      return new OpenStreetMapProvider();
    }
    return null;
  }, []);

  const searchLocation = useMemo(
    () =>
      throttle(
        async (input: string) => {
          if (!provider || input.trim() === "") {
            setOptions([]);
            setLoading(false);
            return;
          }
          setLoading(true);
          try {
            const results = await provider.search({ query: input });
            const mappedResults: GeoSearchResult[] = results
              .filter((r) => r.bounds !== null)
              .map((r) => ({
                x: r.x,
                y: r.y,
                label: r.label,
                bounds: r.bounds as [[number, number], [number, number]],
                raw: r.raw,
              }));
            setOptions(mappedResults);
          } catch (error) {
            console.error("Error searching for location:", error);
            setOptions([]);
          }
          setLoading(false);
        },
        300,
        { leading: false, trailing: true }
      ),
    [provider]
  );

  useEffect(() => {
    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return;
    }

    searchLocation(inputValue);

    // Cleanup function
    return () => {
      searchLocation.cancel();
    };
  }, [inputValue, searchLocation, value]);

  return (
    <Autocomplete
      id={name}
      fullWidth
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event, newValue) => {
        if (onChange) {
          onChange(newValue);
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.label
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={t(label)}
          required={required}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">{icon}</InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={`${option.label}-${option.y}-${option.x}`}>
          {option.label}
        </li>
      )}
    />
  );
};

export default FormGeoSearchField;
