import React, { createContext, useState, useContext } from 'react';
import { useToast } from '@chakra-ui/react';

const OverlayContext = createContext();

export const OverlayProvider = ({ children }) => {
  const toast = useToast();
  const [daoSwitcherModal, setDaoSwitcherModal] = useState(false);
  const [hubAccountModal, setHubAccountModal] = useState(false);
  const [daoAccountModal, setDaoAccountModal] = useState(false);
  const [proposalModal, setProposalModal] = useState(false);

  const errorToast = (content) => {
    toast({
      title: content.title,
      description: content.description,
      position: 'top-right',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
  };
  const successToast = (content) => {
    toast({
      title: content.title,
      description: content.description,
      position: 'top-right',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  const warningToast = (content) => {
    toast({
      title: content.title,
      description: content.description,
      position: 'top-right',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <OverlayContext.Provider
      value={{
        daoSwitcherModal,
        setDaoSwitcherModal,
        hubAccountModal,
        setHubAccountModal,
        daoAccountModal,
        setDaoAccountModal,
        proposalModal,
        setProposalModal,
        errorToast,
        successToast,
        warningToast,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};

export default OverlayProvider;

export const useOverlay = () => {
  const {
    daoSwitcherModal,
    setDaoSwitcherModal,
    hubAccountModal,
    setHubAccountModal,
    daoAccountModal,
    setDaoAccountModal,
    proposalModal,
    setProposalModal,
    errorToast,
    successToast,
    warningToast,
  } = useContext(OverlayContext);
  return {
    daoSwitcherModal,
    setDaoSwitcherModal,
    daoAccountModal,
    setDaoAccountModal,
    hubAccountModal,
    setHubAccountModal,
    proposalModal,
    setProposalModal,
    errorToast,
    successToast,
    warningToast,
  };
};