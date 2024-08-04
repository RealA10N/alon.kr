export interface Package {
	name: string;
	title: string;
	description: string;
	versionSourceControl: 'bzr' | 'fossil' | 'git' | 'hg' | 'svn';
	sourceUrl: string;
}

export const packageUrl = (pkg: Package) => {
	return 'alon.kr/x/' + pkg.name;
};

export const documentationUrl = (pkg: Package) => {
	return 'https://pkg.go.dev/' + packageUrl(pkg);
};
