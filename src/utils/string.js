export const getInitials = (string) => {
    if (typeof string !== 'string') {
        return '';
    }
    let names = string.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
};