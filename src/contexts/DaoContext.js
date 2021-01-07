import React, {
  useEffect,
  useContext,
  createContext,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { BANK_BALANCES } from "../graphQL/bank-queries";
import { DAO_ACTIVITIES, HOME_DAO } from "../graphQL/dao-queries";
import { MEMBERS_LIST } from "../graphQL/member-queries";
import { PROPOSALS_LIST } from "../graphQL/proposal-queries";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { multiFetch } from "../utils/apollo";
import { supportedChains } from "../utils/chain";
import { useInjectedProvider } from "./InjectedProviderContext";

export const DaoContext = createContext();

export const DaoProvider = ({ children }) => {
  const { daoid, daochain } = useParams();
  const { injectedChain, injectedProvider } = useInjectedProvider();

  const daoNetworkData = supportedChains[daochain];
  const isCorrectNetwork = daochain === injectedChain?.chainId;

  const [daoProposals, setDaoProposals] = useSessionStorage(
    `proposals-${daoid}`,
    null
  );
  const [daoActivities, setDaoActivities] = useSessionStorage(
    `activities-${daoid}`,
    null
  );
  const [daoOverview, setDaoOverview] = useSessionStorage(
    `overview-${daoid}`,
    null
  );
  const [daoMembers, setDaoMembers] = useSessionStorage(
    `members-${daoid}`,
    null
  );
  const [daoBalances, setDaoBalances] = useSessionStorage(
    `balances-${daoid}`,
    null
  );
  const [isMember, setIsMember] = useState(false);

  const hasCheckedIsMember = useRef(false);

  useEffect(() => {
    // if (!isCorrectNetwork) return;
    if (
      daoProposals ||
      daoActivities ||
      daoOverview ||
      daoMembers ||
      daoBalances
    )
      return;
    if (!daoid || !injectedChain || !daoNetworkData) return;

    multiFetch([
      {
        endpoint: daoNetworkData.subgraph_url,
        query: PROPOSALS_LIST,
        variables: {
          contractAddr: daoid,
          skip: 0,
        },
        reactSetter: setDaoProposals,
      },
      {
        endpoint: daoNetworkData.subgraph_url,
        query: HOME_DAO,
        variables: {
          contractAddr: daoid,
        },
        reactSetter: setDaoOverview,
      },
      {
        endpoint: daoNetworkData.subgraph_url,
        query: MEMBERS_LIST,
        variables: {
          contractAddr: daoid,
          skip: 0,
        },
        reactSetter: setDaoMembers,
      },

      {
        endpoint: daoNetworkData.subgraph_url,
        query: DAO_ACTIVITIES,
        variables: {
          contractAddr: daoid,
          skip: 0,
        },
        reactSetter: setDaoActivities,
      },
      {
        endpoint: daoNetworkData.stats_graph_url,
        query: BANK_BALANCES,
        variables: {
          molochAddress: daoid,
          skip: 0,
        },
        reactSetter: setDaoBalances,
      },
    ]);
  }, [
    daoid,
    injectedChain,
    daoNetworkData,
    daoActivities,
    daoBalances,
    daoMembers,
    daoOverview,
    daoProposals,
    setDaoActivities,
    setDaoBalances,
    setDaoMembers,
    setDaoOverview,
    setDaoProposals,
    isCorrectNetwork,
  ]);

  useEffect(() => {
    const checkIfMember = (membersObj) => {
      return membersObj.daoMembers.some(
        (member) =>
          member.memberAddress === injectedProvider.provider.selectedAddress
      );
    };
    if (daoMembers && !hasCheckedIsMember.current && injectedProvider) {
      setIsMember(checkIfMember(daoMembers));
      hasCheckedIsMember.current = true;
    }
  }, [daoMembers, injectedProvider]);

  return (
    <DaoContext.Provider
      value={{
        daoProposals,
        daoActivities,
        daoBalances,
        daoMembers,
        daoOverview,
        isMember,
        isCorrectNetwork,
      }}
    >
      {children}
    </DaoContext.Provider>
  );
};

export const useLocalDaoData = () => {
  const {
    daoProposals,
    daoActivities,
    daoBalances,
    daoMembers,
    daoOverview,
    isMember,
    isCorrectNetwork,
  } = useContext(DaoContext);
  return {
    daoProposals,
    daoActivities,
    daoBalances,
    daoMembers,
    daoOverview,
    isMember,
    isCorrectNetwork,
  };
};