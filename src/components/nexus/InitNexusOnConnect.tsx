"use client";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import type { EthereumProvider } from "@avail-project/nexus-core";
import { useNexus } from "./NexusProvider";

export function InitNexusOnConnect() {
  const { status, connector } = useAccount();
  const { handleInit } = useNexus();

  useEffect(() => {
    if (status === "connected") {
      connector?.getProvider().then((p) => handleInit(p as EthereumProvider));
    }
  }, [status, connector, handleInit]);

  return null;
}
