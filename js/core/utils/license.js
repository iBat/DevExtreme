import config from '../config';
import { logger } from './console';
import { version } from '../version';

let checked = false;

export const checkLicense = function() {
    if(checked) {
        return;
    }
    const encodedLicense = /* process.env.DX_LICENSE || */ config().license || '';

    try {
        // TODO do a real license key extraction
        // eslint-disable-next-line no-undef
        const decodedLicense = JSON.parse(atob(encodedLicense));
        const currentMinor = version.substr(0, version.lastIndexOf('.'));

        if(decodedLicense?.versions.indexOf(currentMinor) === -1) {
            logger.warn('License not found or invalid!');
        }
    } catch(err) {
        logger.warn(err.message);
    }
    checked = true;
};

///#DEBUG
export function resetLicenseCheckSkipCondition() {
    checked = false;
}

export function getLicenseCheckSkipCondition() {
    return checked;
}
///#ENDDEBUG
