import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import Nav from "@/components/Nav";
import StepProgress from "@/components/StepProgress";
import ListingCard from "@/features/listings/ListingCard";
import { lithuanianCities } from "@/lib/mockData";
import { DISTRICTS } from "@/lib/districts";
import { useCreateListing, useUpdateListing, useListing } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ListingType, GenderPref, ListingStatus } from "@/api/generated/data-contracts";
import type { Listing } from "@/api/generated/data-contracts";
import { Home, Search, Lock } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const CreateListing = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Fetch existing listing in edit mode (disabled when creating)
  const { data: existingData, isLoading: loadingExisting } = useListing(id ?? "");
  const existing = existingData?.data;

  const { mutateAsync: createListing, isPending: creating } = useCreateListing();
  const { mutateAsync: updateListing, isPending: updating } = useUpdateListing(id ?? "");
  const isPending = creating || updating;

  const [step, setStep] = useState(0);
  const steps = ["Type & basics", "Details", "Photos", "Preview & publish"];

  // Step 1
  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [districtOther, setDistrictOther] = useState(false);
  const [price, setPrice] = useState("");
  const [utilitiesIncl, setUtilitiesIncl] = useState(false);

  const [streetAddress, setStreetAddress] = useState("");
  const [addressSelected, setAddressSelected] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Step 2
  const [description, setDescription] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [genderPref, setGenderPref] = useState<GenderPref>(GenderPref.Any);
  const [smoking, setSmoking] = useState(false);
  const [pets, setPets] = useState(false);

  // Step 3 (photos — no API backing yet)
  const [photos, setPhotos] = useState<string[]>([]);

  // Pre-fill form fields when existing listing data arrives (runs only once)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (existing && !hasInitialized.current) {
      hasInitialized.current = true;
      setListingType(existing.listing_type);
      setTitle(existing.title);
      setCity(existing.city);
      const existingDistrict = existing.district ?? "";
      const predefined = DISTRICTS[existing.city] ?? [];
      const isOther = existingDistrict !== "" && !predefined.includes(existingDistrict);
      setDistrict(existingDistrict);
      setDistrictOther(isOther);
      const addr = existing.street_address ?? "";
      setStreetAddress(addr);
      if (addr) setAddressSelected(true);
      setPrice(String(existing.price));
      setUtilitiesIncl(existing.utilities_incl);
      setDescription(existing.description);
      setAvailableFrom(existing.available_from.slice(0, 10));
      setGenderPref(existing.gender_pref);
      setSmoking(existing.allows_smoking);
      setPets(existing.allows_pets);
      setPhotos(existing.photos ?? []);
    }
  }, [existing]);

  if (!isSignedIn) {
    navigate("/login");
    return null;
  }

  // Show loading state while fetching existing listing in edit mode
  if (isEditMode && loadingExisting) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // If edit mode but listing not found (after load)
  if (isEditMode && !loadingExisting && !existing) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Listing not found.</p>
        </div>
      </div>
    );
  }

  const previewListing: Listing = {
    id: id ?? "preview",
    tenant_id: "",
    listing_type: listingType ?? ListingType.Offering,
    title: title || "Your listing title",
    description,
    district: district || null,
    city: city || "Vilnius",
    price: parseInt(price) || 0,
    utilities_incl: utilitiesIncl,
    available_from: availableFrom || new Date().toISOString().slice(0, 10),
    allows_smoking: smoking,
    allows_pets: pets,
    gender_pref: genderPref,
    status: ListingStatus.Active,
    is_boosted: false,
    photos,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handlePublish = async () => {
    try {
      if (isEditMode) {
        await updateListing({
          listing_type: listingType!,
          title,
          description,
          city,
          district: district || null,
          street_address: streetAddress || null,
          price: parseInt(price),
          utilities_incl: utilitiesIncl,
          available_from: availableFrom,
          allows_smoking: smoking,
          allows_pets: pets,
          gender_pref: genderPref,
          photos,
        });
        toast({ title: "Listing updated!" });
        navigate(`/listings/${id}`);
      } else {
        await createListing({
          listing_type: listingType!,
          title,
          description,
          city,
          district: district || null,
          street_address: streetAddress || null,
          price: parseInt(price),
          utilities_incl: utilitiesIncl,
          available_from: availableFrom,
          allows_smoking: smoking,
          allows_pets: pets,
          gender_pref: genderPref,
          status: ListingStatus.Active,
          photos,
        });
        toast({ title: "Your listing is live!" });
        navigate("/listings");
      }
    } catch {
      toast({
        title: isEditMode ? "Failed to update" : "Failed to publish",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <StepProgress steps={steps} currentStep={step} />

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">What are you posting?</h2>
            <div className="grid grid-cols-2 gap-4">
              {([
                { value: ListingType.Offering, icon: <Home size={24} />, label: "I have a room", desc: "I'm offering a room in my flat" },
                { value: ListingType.Seeking, icon: <Search size={24} />, label: "I'm looking for a room", desc: "I need a flatmate" },
              ]).map(opt => (
                <button key={opt.value} onClick={() => setListingType(opt.value)}
                  className={`rounded-xl border-2 p-5 text-left transition-colors ${
                    listingType === opt.value ? "border-primary bg-primary-light" : "border-border hover:border-primary/30"
                  }`}>
                  <div className="mb-2 text-primary">{opt.icon}</div>
                  <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </button>
              ))}
            </div>
            <input type="text" placeholder="e.g. Bright room in Žirmūnai, bills included" value={title}
              onChange={e => setTitle(e.target.value.slice(0, 80))}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <p className="text-right text-xs text-muted-foreground">{title.length}/80</p>
            <select
              value={city}
              onChange={e => { setCity(e.target.value); setDistrict(""); setDistrictOther(false); }}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Select city</option>
              {lithuanianCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {DISTRICTS[city] ? (
              districtOther ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type district / neighbourhood"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => { setDistrictOther(false); setDistrict(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Back
                  </button>
                </div>
              ) : (
                <select
                  value={district}
                  onChange={e => {
                    if (e.target.value === "other") { setDistrictOther(true); setDistrict(""); }
                    else setDistrict(e.target.value);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">District / neighbourhood (optional)</option>
                  {DISTRICTS[city].map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="other">Other (type manually)</option>
                </select>
              )
            ) : (
              <input
                type="text"
                placeholder="Neighbourhood / district (optional)"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
            )}
            <div>
              <AddressAutocomplete
                value={streetAddress}
                onChange={(val) => {
                  setStreetAddress(val);
                  setAddressSelected(false);
                  setAddressError("");
                }}
                onPlaceSelect={({ address, district, city }) => {
                  setStreetAddress(address);
                  setAddressSelected(true);
                  setAddressError("");
                  if (city) setCity(city);
                  if (district) {
                    const predefined = DISTRICTS[city] ?? [];
                    setDistrict(district);
                    setDistrictOther(!predefined.includes(district));
                  }
                }}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary bg-background ${
                  addressError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                }`}
              />
              {addressError && (
                <p className="mt-1 text-xs text-destructive">{addressError}</p>
              )}
              <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-surface-elevated px-3 py-2">
                <Lock size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Your exact address is only visible to you. Others see only the neighbourhood.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)}
                className="w-32 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              <span className="text-sm text-muted-foreground">€ / month</span>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={utilitiesIncl} onChange={() => setUtilitiesIncl(!utilitiesIncl)}
                className="rounded border-border text-primary focus:ring-primary" />
              Utilities included in price
            </label>
            <button
              onClick={() => {
                if (!addressSelected) {
                  setAddressError("Please select an address from the suggestions");
                  return;
                }
                setStep(1);
              }}
              disabled={!listingType || !title || !city || !price}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Details</h2>
            <div>
              <textarea placeholder="Describe the room, the flat, your lifestyle..." value={description}
                onChange={e => setDescription(e.target.value.slice(0, 800))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" rows={5} />
              <p className="text-right text-xs text-muted-foreground">{description.length}/800</p>
            </div>
            <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Gender preference</p>
              <div className="flex gap-2">
                {([GenderPref.Any, GenderPref.Male, GenderPref.Female] as const).map(g => (
                  <button key={g} onClick={() => setGenderPref(g)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      genderPref === g ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                    }`}>{g === GenderPref.Any ? "Any" : g + " only"}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { label: smoking ? "✓ Smoking ok" : "✗ No smoking", active: smoking, toggle: () => setSmoking(!smoking) },
                { label: pets ? "✓ Pets welcome" : "✗ No pets", active: pets, toggle: () => setPets(!pets) },
              ].map(item => (
                <button key={item.label} onClick={item.toggle}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    item.active ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                  }`}>{item.label}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">← Back</button>
              <button onClick={() => setStep(2)} disabled={!description || !availableFrom}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Photos</h2>
            <PhotoUpload value={photos} onChange={setPhotos} max={5} />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">← Back</button>
              <button onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">
              {isEditMode ? "Review your changes" : "Your listing preview"}
            </h2>
            <div className="mx-auto max-w-sm">
              <ListingCard listing={previewListing} />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {isEditMode ? "Review your edits before saving." : "This is how your listing will appear to others."}
            </p>
            <button onClick={handlePublish} disabled={isPending}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50">
              {isPending
                ? (isEditMode ? "Saving..." : "Publishing...")
                : (isEditMode ? "Save changes" : "Publish listing")}
            </button>
            <button onClick={() => setStep(2)}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
