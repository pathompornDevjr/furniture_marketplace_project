import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useEffect, useState } from "react";

// In-memory cache across navigation
let globalProvinces = null;
let globalProvinceOptions = null;
let globalFetchPromise = null;

export default function useProvince() {
  const [provinces, setProvinces] = useState(globalProvinces || []);
  const [provinceOptions, setProvinceOptions] = useState(globalProvinceOptions || []);
  const [loading, setLoading] = useState(!globalProvinces);

  const fetchProvinces = async () => {
    if (globalProvinces && globalProvinceOptions) {
      setProvinces(globalProvinces);
      setProvinceOptions(globalProvinceOptions);
      setLoading(false);
      return;
    }

    if (globalFetchPromise) {
      const data = await globalFetchPromise;
      if (data) {
        setProvinces(data.provinces);
        setProvinceOptions(data.options);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    globalFetchPromise = (async () => {
      try {
        // Try local static file first for speed and offline reliability
        let res;
        try {
          res = await axios.get("/data/thai_provinces.json");
        } catch {
          // Fallback to github if needed
          res = await axios.get(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json"
          );
        }

        const provinceData = res.data;
        const options = provinceData.map((p) => ({
          label: p.name_th,
          value: p.name_th,
        }));

        globalProvinces = provinceData;
        globalProvinceOptions = options;

        return { provinces: provinceData, options };
      } catch (err) {
        console.error("Error loading provinces:", err);
        return null;
      } finally {
        globalFetchPromise = null;
      }
    })();

    const result = await globalFetchPromise;
    if (result) {
      setProvinces(result.provinces);
      setProvinceOptions(result.options);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  return {
    provinces,
    loading,
    provinceOptions,
  };
}
