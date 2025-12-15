import React, { useState, useRef, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import type { PersonalDetails } from "src/types/resume";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  TagInput,
  FormSection,
  RichTextEditor,
} from "@/pages/(ResumeBuilder)/components/ui";
import { Lock, X, Save, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { deleteFromCloudinary } from "@/utils/deleteFromCloudinary";
import { updatePersonalDetails } from "@/services/personalService";

interface PersonalDetailsFormProps {
  data: PersonalDetails;
  onChange: (data: PersonalDetails) => void;
  userId: string;
  token: string;
  personalDetailsId: string | null;
  supportsPhoto?: boolean;
}

const countries = [
  { value: "India", label: "India" },
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
];

const indianStates = [
  { value: "Karnataka", label: "Karnataka" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Delhi", label: "Delhi" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "West Bengal", label: "West Bengal" },
];

const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const ALL_LANGUAGES = [
  "Kannada",
  "English",
  "Tamil",
  "Hindi",
  "Telugu",
  "Malayalam",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "French",
  "Spanish",
  "German",
  "Mandarin",
  "Japanese",
];

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  data,
  onChange,
  userId,
  token,
  personalDetailsId,
  supportsPhoto = true,
}) => {
  const [personalInfoCollapsed, setPersonalInfoCollapsed] = useState(false);
  const [languagesCollapsed, setLanguagesCollapsed] = useState(false);
  const [locationDetailsCollapsed, setLocationDetailsCollapsed] =
    useState(false);
  const [careerObjectiveCollapsed, setCareerObjectiveCollapsed] =
    useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [languagesEnabled, setLanguagesEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const [languagesChanged, setLanguagesChanged] = useState(false);
  const [locationChanged, setLocationChanged] = useState(false);
  const [careerObjectiveChanged, setCareerObjectiveChanged] = useState(false);

  const [languagesFeedback, setLanguagesFeedback] = useState("");
  const [locationFeedback, setLocationFeedback] = useState("");
  const [careerObjectiveFeedback, setCareerObjectiveFeedback] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialLanguages = useRef<string[]>(data.languagesKnown || []);
  const [newLanguage, setNewLanguage] = useState("");
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const languageInputRef = useRef<HTMLInputElement>(null);
  const languageContainerRef = useRef<HTMLDivElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const initialLocation = useRef({
    address: data.address || "",
    country: data.country || "",
    state: data.state || "",
    city: data.city || "",
    pincode: data.pincode || "",
    nationality: data.nationality || "",
    passportNumber: data.passportNumber || "",
  });
  const initialCareerObjective = useRef<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [changedLocationFields, setChangedLocationFields] = useState<string[]>(
    []
  );

  useEffect(() => {
    const hasChanged =
      JSON.stringify(data.languagesKnown) !==
      JSON.stringify(initialLanguages.current);
    setLanguagesChanged(hasChanged);
  }, [data.languagesKnown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        languageContainerRef.current &&
        !languageContainerRef.current.contains(event.target as Node) &&
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node)
      ) {
        const trimmedLang = newLanguage.trim();
        const isValidLanguage = ALL_LANGUAGES.some(
          (lang) => lang.toLowerCase() === trimmedLang.toLowerCase()
        );

        if (trimmedLang && !isValidLanguage) {
          setNewLanguage("");
        }

        setShowLanguageSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [newLanguage]);

  // update dropdown rect when suggestions open or window scroll/resize
  useEffect(() => {
    if (!showLanguageSuggestions) return;

    const updateRect = () => {
      const el = languageInputRef.current || languageContainerRef.current;
      if (el) setDropdownRect(el.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [showLanguageSuggestions, newLanguage]);

  const handleLanguageInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewLanguage(e.target.value);
    setShowLanguageSuggestions(true);
  };

  const handleSelectLanguage = (language: string) => {
    if (!data.languagesKnown.includes(language.trim())) {
      onChange({ ...data, languagesKnown: [...data.languagesKnown, language.trim()] });
    }
    setNewLanguage("");
    setShowLanguageSuggestions(false);
  };

  const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newLanguage.trim()) {
      e.preventDefault();

      const exactMatch = filteredSuggestions.find(
        (lang) => lang.toLowerCase() === newLanguage.trim().toLowerCase()
      );

      if (exactMatch && !data.languagesKnown.includes(exactMatch)) {
        onChange({ ...data, languagesKnown: [...data.languagesKnown, exactMatch] });
        setNewLanguage("");
      } else if (newLanguage.trim() && filteredSuggestions.length === 0) {
        setNewLanguage("");
      }

      setShowLanguageSuggestions(false);
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    onChange({
      ...data,
      languagesKnown: data.languagesKnown.filter((lang) => lang !== languageToRemove),
    });
  };

  const filteredSuggestions = useMemo(() => {
    if (!newLanguage.trim()) return [];
    const normalizedInput = newLanguage.trim().toLowerCase();

    return ALL_LANGUAGES.filter(
      (lang) =>
        lang.toLowerCase().startsWith(normalizedInput) &&
        !data.languagesKnown.some((addedLang: string) => addedLang.toLowerCase() === lang.toLowerCase())
    ).slice(0, 5);
  }, [newLanguage, data.languagesKnown]);

  useEffect(() => {
    const changedFields: string[] = [];

    if (data.address !== initialLocation.current.address)
      changedFields.push("address");
    if (data.country !== initialLocation.current.country)
      changedFields.push("country");
    if (data.state !== initialLocation.current.state)
      changedFields.push("state");
    if (data.city !== initialLocation.current.city) changedFields.push("city");
    if (data.pincode !== initialLocation.current.pincode)
      changedFields.push("pincode");
    if (data.nationality !== initialLocation.current.nationality)
      changedFields.push("nationality");
    if (data.passportNumber !== initialLocation.current.passportNumber)
      changedFields.push("passportNumber");

    setChangedLocationFields(changedFields);
    setLocationChanged(changedFields.length > 0);
  }, [
    data.address,
    data.country,
    data.state,
    data.city,
    data.pincode,
    data.nationality,
    data.passportNumber,
  ]);

  // Initialize the ref only once when component mounts or data first loads
  useEffect(() => {
    if (!isInitialized) {
      initialCareerObjective.current = data.aboutCareerObjective || "";
      setIsInitialized(true);
    }
  }, [isInitialized, data.aboutCareerObjective]);

  useEffect(() => {
    if (!isInitialized) return;

    const currentValue = data.aboutCareerObjective || "";
    const initialValue = initialCareerObjective.current || "";
    const hasChanged = currentValue !== initialValue;

    setCareerObjectiveChanged(hasChanged);
  }, [data.aboutCareerObjective, isInitialized]);

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = "Only letters allowed";
        }
        break;

      case "middleName":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = "Only letters allowed";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email format";
        }
        break;

      case "mobileNumber":
        if (value && !/^\d{0,10}$/.test(value)) {
          error = "Only 10 digits allowed";
        } else if (value && value.length > 0 && value.length < 10) {
          error = "Must be 10 digits";
        }
        break;

      case "pincode":
        if (value && !/^\d{0,6}$/.test(value)) {
          error = "Only 6 digits allowed";
        } else if (value && value.length > 0 && value.length < 6) {
          error = "Must be 6 digits";
        }
        break;

      case "passportNumber":
        if (value && !/^[A-Z0-9]*$/.test(value)) {
          error = "Only uppercase letters and numbers allowed";
        } else if (value && !/(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Must contain at least one letter and one number";
        }
        break;
    }

    return error;
  };

  const updateField = <K extends keyof PersonalDetails>(
    field: K,
    value: PersonalDetails[K]
  ) => {
    let newValue: any = value;

    if (
      field === "mobileNumber" &&
      typeof newValue === "string" &&
      newValue.length > 10
    ) {
      return;
    }

    if (field === "pincode" && typeof newValue === "string" && newValue.length > 6) {
      return;
    }

    if (field === "passportNumber" && typeof newValue === "string") {
      const upperValue = newValue.toUpperCase();
      if (!/^[A-Z0-9]*$/.test(upperValue)) {
        setErrors((prev) => ({ ...prev, [field]: "Only uppercase letters and numbers allowed" }));
        return;
      }
      if (upperValue.length > 8) return;
      newValue = upperValue;
      // If the value doesn't contain both a letter and a digit, show error
      if (!/(?=.*[A-Z])(?=.*\d)/.test(upperValue)) {
        setErrors((prev) => ({ ...prev, [field]: "Must contain at least one letter and one number" }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }

    console.log("Updating field:", field, "with value:", newValue);
    onChange({ ...data, [field]: newValue });

    if (typeof newValue === "string") {
      const error = validateField(field, newValue);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const cloudinaryRes = await uploadToCloudinary(file);

      onChange({
        ...data,
        profilePhotoUrl: cloudinaryRes.url,
      });

      if (personalDetailsId) {
        const payload = {
          profile_photo_url: cloudinaryRes.url,
        };
        await updatePersonalDetails(userId, token, personalDetailsId, payload);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      if (personalDetailsId) {
        const payload = {
          profile_photo_url: "",
        };
        await updatePersonalDetails(userId, token, personalDetailsId, payload);
      }

      onChange({
        ...data,
        profilePhotoUrl: "",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  const handleUpdateLanguages = async () => {
    if (!personalDetailsId) {
      setLanguagesFeedback("Unable to save: Missing personal details ID");
      setTimeout(() => setLanguagesFeedback(""), 3000);
      return;
    }

    try {
      const payload = {
        languages_known: data.languagesKnown,
      };

      await updatePersonalDetails(userId, token, personalDetailsId, payload);
      initialLanguages.current = [...data.languagesKnown];
      setLanguagesChanged(false);
      setLanguagesFeedback("Languages updated successfully!");
      setTimeout(() => setLanguagesFeedback(""), 3000);
    } catch (error) {
      console.error("Error updating languages:", error);
      setLanguagesFeedback("Failed to update languages");
      setTimeout(() => setLanguagesFeedback(""), 3000);
    }
  };

  const handleResetLanguages = () => {
    onChange({
      ...data,
      languagesKnown: [...initialLanguages.current],
    });
    setLanguagesChanged(false);
    setLanguagesFeedback("");
  };

  const handleUpdateLocation = async () => {
    if (!personalDetailsId || changedLocationFields.length === 0) {
      if (!personalDetailsId) {
        setLocationFeedback("Unable to save: Missing personal details ID");
        setTimeout(() => setLocationFeedback(""), 3000);
      }
      return;
    }

    try {
      const payload: any = {};

      changedLocationFields.forEach((field) => {
        switch (field) {
          case "address":
            payload.address = data.address;
            break;
          case "country":
            payload.country = data.country;
            break;
          case "state":
            payload.state = data.state;
            break;
          case "city":
            payload.city = data.city;
            break;
          case "pincode":
            payload.pincode = data.pincode;
            break;
          case "nationality":
            payload.nationality = data.nationality;
            break;
          case "passportNumber":
            payload.passport_number = data.passportNumber;
            break;
        }
      });

      await updatePersonalDetails(userId, token, personalDetailsId, payload);

      initialLocation.current = {
        address: data.address,
        country: data.country,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        nationality: data.nationality,
        passportNumber: data.passportNumber,
      };

      setLocationChanged(false);
      setChangedLocationFields([]);
      setLocationFeedback("Location updated successfully!");
      setTimeout(() => setLocationFeedback(""), 3000);
    } catch (error) {
      console.error("Error updating location:", error);
      setLocationFeedback("Failed to update location");
      setTimeout(() => setLocationFeedback(""), 3000);
    }
  };

  const handleResetLocation = () => {
    onChange({
      ...data,
      address: initialLocation.current.address,
      country: initialLocation.current.country,
      state: initialLocation.current.state,
      city: initialLocation.current.city,
      pincode: initialLocation.current.pincode,
      nationality: initialLocation.current.nationality,
      passportNumber: initialLocation.current.passportNumber,
    });
    setLocationChanged(false);
    setChangedLocationFields([]);
    setLocationFeedback("");
  };

  const handleUpdateCareerObjective = async () => {
    if (!personalDetailsId) {
      setCareerObjectiveFeedback("Unable to save: Missing personal details ID");
      setTimeout(() => setCareerObjectiveFeedback(""), 3000);
      return;
    }

    try {
      const payload = {
        about: data.aboutCareerObjective,
      };

      await updatePersonalDetails(userId, token, personalDetailsId, payload);

      initialCareerObjective.current = data.aboutCareerObjective ?? "";
      setCareerObjectiveChanged(false);
      setCareerObjectiveFeedback("Career Objective updated successfully!");
      setTimeout(() => setCareerObjectiveFeedback(""), 3000);
    } catch (error) {
      console.error("Error updating career objective:", error);
      setCareerObjectiveFeedback("Failed to update Career Objective");
      setTimeout(() => setCareerObjectiveFeedback(""), 3000);
    }
  };

  const handleResetCareerObjective = () => {
    onChange({
      ...data,
      aboutCareerObjective: initialCareerObjective.current ?? "",
    });
    setCareerObjectiveChanged(false);
    setCareerObjectiveFeedback("");
  };

  const CollapseButton = ({
    isCollapsed,
    onClick,
  }: {
    isCollapsed: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:text-gray-800 hover:border-gray-600 transition-colors"
      aria-expanded={!isCollapsed}
      aria-controls="section-content"
    >
      {isCollapsed ? (
        <ChevronDown size={14} strokeWidth={2.2} />
      ) : (
        <ChevronUp size={14} strokeWidth={2.2} />
      )}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* If the selected template does not support photos, show a notice in the form */}
      {supportsPhoto === false && (
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 1a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4z" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">This Template does not support photo upload</div>
            {/* <div className="text-xs text-gray-500">Select a template that supports photos to show your image</div> */}
          </div>
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-xl overflow-visible">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">
            Profile Photo
          </span>
        </div>
        <div className="p-4">
          <div className="flex flex-col items-center">
            <div
              onClick={() =>
                !data.profilePhotoUrl && fileInputRef.current?.click()
              }
              className={`relative w-32 h-32 bg-gray-100 rounded-lg border-2 ${
                data.profilePhotoUrl
                  ? "border-gray-300"
                  : "border-dashed border-gray-300"
              } flex items-center justify-center overflow-hidden ${
                !data.profilePhotoUrl
                  ? "cursor-pointer hover:border-orange-400 transition-colors group"
                  : ""
              }`}
            >
              {data.profilePhotoUrl ? (
                <>
                  <img
                    src={data.profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhotoDelete();
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-100 z-10 transition-colors"
                    title="Delete photo"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </>
              ) : (
                <svg
                  className="w-12 h-12 text-gray-400 group-hover:text-orange-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-gray-700 hover:text-orange-400 font-medium transition-colors"
            >
              {data.profilePhotoUrl ? "Change Photo" : "Upload Profile Photo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">
            Personal Info
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">
                Read-only
              </span>
            </div>
            <CollapseButton
              isCollapsed={personalInfoCollapsed}
              onClick={() => setPersonalInfoCollapsed(!personalInfoCollapsed)}
            />
          </div>
        </div>
        {!personalInfoCollapsed && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="First Name"
                placeholder="Aarav"
                value={data.firstName}
                onChange={(v) => updateField("firstName", v)}
                error={errors.firstName}
                disabled={true}
              />
              <FormInput
                label="Middle Name"
                placeholder="Enter Middle Name"
                value={data.middleName}
                onChange={(v) => updateField("middleName", v)}
                error={errors.middleName}
                disabled={true}
              />
              <FormInput
                label="Last Name"
                placeholder="Mehta"
                value={data.lastName}
                onChange={(v) => updateField("lastName", v)}
                error={errors.lastName}
                disabled={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Email"
                placeholder="aarav.m@gmail.com"
                value={data.email}
                onChange={(v) => updateField("email", v)}
                type="email"
                error={errors.email}
                disabled={true}
              />
              <div>
                <label className="block text-xs text-gray-600 font-medium mb-1">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <FormSelect
                    label=""
                    value="+91"
                    onChange={() => {}}
                    options={[{ value: "+91", label: "+91" }]}
                    className="w-20"
                    disabled={true}
                  />
                  <FormInput
                    label=""
                    placeholder="88888 88888"
                    value={data.mobileNumber}
                    onChange={(v) => updateField("mobileNumber", v)}
                    className="flex-1"
                    error={errors.mobileNumber}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Date of Birth"
                value={data.dateOfBirth}
                onChange={(v) => updateField("dateOfBirth", v)}
                type="date"
                disabled={true}
              />
              <FormSelect
                label="Gender"
                value={data.gender}
                onChange={(v) => updateField("gender", v)}
                options={genders}
                disabled={true}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">
            Language(s) Known
          </span>
          <CollapseButton
            isCollapsed={languagesCollapsed}
            onClick={() => setLanguagesCollapsed(!languagesCollapsed)}
          />
        </div>

        {languagesEnabled && !languagesCollapsed && (
          <div className="p-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              {languagesFeedback && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    languagesFeedback.includes("success")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {languagesFeedback}
                </span>
              )}
              {languagesChanged && (
                <button
                  type="button"
                  onClick={handleUpdateLanguages}
                  className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                  title="Save changes"
                >
                  <Save className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                </button>
              )}
              <button
                type="button"
                onClick={handleResetLanguages}
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
                title="Reset to saved values"
              >
                <RotateCcw className="w-3 h-3 text-gray-600" strokeWidth={2.5} />
              </button>
            </div>

            <div
              ref={languageContainerRef}
              className="relative w-full overflow-visible"
            >
              <div className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent min-h-[38px] sm:min-h-[42px] flex flex-wrap gap-2 items-center">
                {data.languagesKnown.map((lang: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-md text-xs sm:text-sm"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 cursor-pointer" />
                    </button>
                  </span>
                ))}
                <input
                  ref={languageInputRef}
                  type="text"
                  value={newLanguage}
                  onChange={handleLanguageInputChange}
                  onKeyDown={handleAddLanguage}
                  onFocus={() => setShowLanguageSuggestions(true)}
                  placeholder="Add Languages known to you..."
                  className="flex-1 min-w-[150px] sm:min-w-[200px] outline-none text-xs sm:text-sm"
                />
              </div>

              {showLanguageSuggestions && filteredSuggestions.length > 0 && dropdownRect && ReactDOM.createPortal(
                <div
                  ref={suggestionBoxRef}
                  style={{
                    position: "absolute",
                    top: dropdownRect.bottom + window.scrollY + 6,
                    left: dropdownRect.left + window.scrollX,
                    width: dropdownRect.width,
                    zIndex: 9999,
                  }}
                >
                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto w-full">
                    {filteredSuggestions.map((lang, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectLanguage(lang)}
                        className="px-4 py-2 cursor-pointer hover:bg-orange-50 text-gray-700 text-sm whitespace-nowrap"
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">
            Location Details
          </span>
          <CollapseButton
            isCollapsed={locationDetailsCollapsed}
            onClick={() =>
              setLocationDetailsCollapsed(!locationDetailsCollapsed)
            }
          />
        </div>

        {locationEnabled && !locationDetailsCollapsed && (
          <div className="p-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              {locationFeedback && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    locationFeedback.includes("success")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {locationFeedback}
                </span>
              )}
              {locationChanged && (
                <button
                  type="button"
                  onClick={handleUpdateLocation}
                  className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                  title="Save changes"
                >
                  <Save className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                </button>
              )}
              <button
                type="button"
                onClick={handleResetLocation}
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
                title="Reset to saved values"
              >
                <RotateCcw className="w-3 h-3 text-gray-600" strokeWidth={2.5} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Country"
                placeholder="Select Country"
                value={data.country}
                onChange={(v) => updateField("country", v)}
                options={countries}
              />
              <FormSelect
                label="State"
                placeholder="Select State"
                value={data.state}
                onChange={(v) => updateField("state", v)}
                options={indianStates}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormSelect
                label="City"
                placeholder="Select City"
                value={data.city}
                onChange={(v) => updateField("city", v)}
                options={[
                  { value: "Bengaluru", label: "Bengaluru" },
                  { value: "Mumbai", label: "Mumbai" },
                  { value: "Delhi", label: "Delhi" },
                  { value: "Chennai", label: "Chennai" },
                  { value: "Hyderabad", label: "Hyderabad" },
                ]}
              />
              <FormInput
                label="Pincode"
                placeholder="Enter Pincode"
                value={data.pincode}
                onChange={(v) => updateField("pincode", v)}
                error={errors.pincode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Address"
                placeholder="Enter Address"
                value={data.address}
                onChange={(v) => updateField("address", v)}
              />
              <FormInput
                label="Nationality"
                placeholder="Enter Nationality"
                value={data.nationality}
                onChange={(v) => updateField("nationality", v)}
              />
            </div>

            <div className="mt-4">
              <FormInput
                label="Passport Number"
                placeholder="Enter Passport Number"
                value={data.passportNumber}
                onChange={(v) => updateField("passportNumber", v)}
                error={errors.passportNumber}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">
            About / Career Objective{" "}
            <span className="text-red-500 ml-1">*</span>
          </span>

          <CollapseButton
            isCollapsed={careerObjectiveCollapsed}
            onClick={() =>
              setCareerObjectiveCollapsed(!careerObjectiveCollapsed)
            }
          />
        </div>

        {!careerObjectiveCollapsed && (
          <div className="p-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              {careerObjectiveFeedback && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    careerObjectiveFeedback.includes("success")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {careerObjectiveFeedback}
                </span>
              )}
              {careerObjectiveChanged && (
                <button
                  type="button"
                  onClick={handleUpdateCareerObjective}
                  className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                  title="Save changes"
                >
                  <Save className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                </button>
              )}
              <button
                type="button"
                onClick={handleResetCareerObjective}
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
                title="Reset to saved value"
              >
                <RotateCcw className="w-3 h-3 text-gray-600" strokeWidth={2.5} />
              </button>
            </div>

            <RichTextEditor
              value={data.aboutCareerObjective}
              onChange={(v) => {
                updateField("aboutCareerObjective", v);
                setCareerObjectiveChanged(true);
              }}
              placeholder="Provide Career Objective"
              rows={6}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDetailsForm;