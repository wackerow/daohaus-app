import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DaoService } from '../utils/DaoService';
import { get } from '../utils/Requests';

import { useWeb3, useLoading, useUser, useDao } from './PokemolContext';

const DaoInit = () => {
  const location = useLocation();
  const [, updateDao] = useDao();
  const [web3] = useWeb3();
  const [, updateLoading] = useLoading();
  const [user] = useUser();

  useEffect(() => {
    var pathname = location.pathname.split('/');
    const daoParam = pathname[2];
    const regex = RegExp('0x[0-9a-f]{10,40}');
    const validParam =
      pathname[1] === 'dao' && regex.test(daoParam) ? daoParam : false;

    if (validParam) {
      initDao(daoParam);
    } else {
      updateDao(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, web3]);

  const initDao = async (daoParam) => {
    updateLoading(true);
    console.log('INIT ', daoParam);

    let daoRes;
    try {
      daoRes = await get(`moloch/${daoParam}`);
    } catch (err) {
      console.log('api fetch error', daoParam);
    }

    console.log('web3', web3);

    const version = daoRes ? daoRes.data.version : '1';

    // TODO: test does useeffect need user too?
    const daoService =
      user && web3.provider
        ? await DaoService.instantiateWithWeb3(
            user.username,
            web3.provider,
            daoParam,
            version,
          )
        : await DaoService.instantiateWithReadOnly(daoParam, version);

    const boostRes = await get(`boosts/${daoParam}`);
    const boosts = boostRes.data.reduce((boosts, boostData) => {
      const metadata = boostData.metadata
        ? JSON.parse(boostData.metadata[0])
        : null;
      boosts[boostData.boostKey] = {
        active: boostData.active,
        metadata,
      };
      return boosts;
    }, {});

    console.log('boosts', boosts);

    // TODO: what all do we want on this and where else will we set it?

    updateDao({
      address: daoParam,
      apiMeta: daoRes ? daoRes.data : null,
      daoService: daoService,
      boosts,
    });
    updateLoading(false);
  };

  return <></>;
};

export default DaoInit;
