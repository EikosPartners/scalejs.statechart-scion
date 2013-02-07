param($installPath, $toolsPath, $package, $project)

$project |
	Remove-Paths 'scalejs.statechart' |
	Remove-ScalejsExtension 'scalejs.statechart' |
	Remove-Shims 'scalejs.statechart' |
	Out-Null
