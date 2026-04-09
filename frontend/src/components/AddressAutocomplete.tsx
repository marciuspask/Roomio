import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface PlaceData {
  address: string;
  district: string;
  city: string;
}

interface Props {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect?: (data: PlaceData) => void;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Street address",
  className,
}: Props) => {
  const places = useMapsLibrary("places");
  const geocodingLib = useMapsLibrary("geocoding");
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const suppressNextFetch = useRef(false);

  useEffect(() => {
    if (places) setAutocompleteService(new places.AutocompleteService());
  }, [places]);

  useEffect(() => {
    if (geocodingLib) setGeocoder(new google.maps.Geocoder());
  }, [geocodingLib]);

  // Sync external value changes (e.g. pre-fill in edit mode)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!autocompleteService || input.length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      autocompleteService.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "lt" },
          types: ["address"],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 5));
            setIsOpen(true);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        },
      );
    },
    [autocompleteService],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    if (!suppressNextFetch.current) {
      fetchSuggestions(val);
    }
    suppressNextFetch.current = false;
  };

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    suppressNextFetch.current = true;
    const address = prediction.description;
    setInputValue(address);
    onChange(address);
    setSuggestions([]);
    setIsOpen(false);

    if (!onPlaceSelect || !geocoder) return;

    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) return;
      const components = results[0].address_components;
      const get = (...types: string[]) =>
        components.find((c) => types.some((t) => c.types.includes(t)))?.long_name ?? "";

      const district = get("sublocality_level_1", "neighborhood", "sublocality");
      const city = get("locality", "administrative_area_level_2");
      onPlaceSelect({ address, district, city });
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        autoComplete="off"
        className={
          className ??
          "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
        }
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-md">
          {suggestions.map((prediction) => (
            <li
              key={prediction.place_id}
              onMouseDown={() => handleSelect(prediction)}
              className="cursor-pointer px-4 py-2.5 text-sm text-foreground hover:bg-surface-elevated"
            >
              <span className="font-medium">
                {prediction.structured_formatting.main_text}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                {prediction.structured_formatting.secondary_text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
